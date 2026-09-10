import type { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import { encode as defaultEncode } from "next-auth/jwt";

import {
  adminGroup,
  authSecret,
  kompassiOidc,
  photographerGroup,
} from "@/config";
import { db } from "@/prisma/db";

const fallbackMaxAgeSeconds = 10 * 60 * 60;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      isPhotographer: boolean;
      isAdmin: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    isPhotographer?: boolean;
    isAdmin?: boolean;
  }
}

interface KompassiProfile {
  sub: string;
  name?: string;
  email?: string;
  groups?: string[];
}

export const authOptions: AuthOptions = {
  secret: authSecret,
  providers: [
    {
      id: "kompassi",
      name: "Kompassi",
      type: "oauth",
      idToken: true,
      authorization: { params: { scope: "openid email profile" } },
      profile(profile: KompassiProfile) {
        return {
          id: profile.sub,
          name: profile.name ?? null,
          email: profile.email ?? null,
          image: null,
        };
      },
      ...kompassiOidc,
    },
  ],
  session: { strategy: "jwt", maxAge: fallbackMaxAgeSeconds },
  jwt: {
    maxAge: fallbackMaxAgeSeconds,
    // Make the session JWT expire together with the Kompassi access token it was issued for.
    encode(params) {
      const exp = params.token?.exp;
      const maxAge =
        typeof exp === "number"
          ? exp - Math.floor(Date.now() / 1000)
          : params.maxAge;
      return defaultEncode({ ...params, maxAge });
    },
  },
  logger: {
    error(code, metadata) {
      // Expected once the JWT outlives the Kompassi access token; the user simply signs in again.
      if (code === "JWT_SESSION_ERROR") return;
      console.error(code, metadata);
    },
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const kompassi = profile as KompassiProfile;
        if (typeof account.expires_at === "number") {
          token.exp = account.expires_at;
        }
        // Only the derived flags go into the cookie: a Kompassi user can belong to hundreds of
        // groups, and the full list pushed the session cookie past Node's 16 KB header limit.
        const groups = kompassi.groups ?? [];
        token.isAdmin = groups.includes(adminGroup);
        token.isPhotographer =
          token.isAdmin || groups.includes(photographerGroup);
        const user = await db.orm.public.User.upsert({
          create: {
            sub: kompassi.sub,
            email: kompassi.email ?? "",
            displayName: kompassi.name ?? "",
          },
          update: {
            email: kompassi.email ?? "",
            displayName: kompassi.name ?? "",
          },
          conflictOn: { sub: kompassi.sub },
        });
        token.userId = user.id;
      }
      return token;
    },
    session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.userId ?? "",
        isPhotographer: token.isPhotographer ?? false,
        isAdmin: token.isAdmin ?? false,
      };
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}
