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
    groups?: string[];
  }
}

interface KompassiProfile {
  sub: string;
  name?: string;
  email?: string;
  preferred_username?: string;
  groups?: string[];
}

function usernameFromProfile(profile: KompassiProfile): string {
  return (
    profile.preferred_username ||
    profile.email?.split("@")[0] ||
    `kompassi-${profile.sub}`
  );
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
        token.groups = kompassi.groups ?? [];
        const user = await db.orm.public.User.upsert({
          create: {
            sub: kompassi.sub,
            username: usernameFromProfile(kompassi),
            email: kompassi.email ?? "",
            displayName: kompassi.name ?? "",
          },
          update: {
            username: usernameFromProfile(kompassi),
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
      const groups = token.groups ?? [];
      session.user = {
        ...session.user,
        id: token.userId ?? "",
        isPhotographer:
          groups.includes(photographerGroup) || groups.includes(adminGroup),
        isAdmin: groups.includes(adminGroup),
      };
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}
