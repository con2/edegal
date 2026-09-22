import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth";
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
      isPhotographer: boolean;
      isAdmin: boolean;
    } & DefaultSession["user"];
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

const config: NextAuthConfig = {
  secret: authSecret,
  // The app is only ever reached through Traefik, which sets the Host header itself.
  trustHost: true,
  providers: [
    {
      id: "kompassi",
      name: "Kompassi",
      type: "oidc",
      // PKCE binds the code to this login, nonce binds the ID token to it; state alone is the default.
      checks: ["pkce", "state", "nonce"],
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
    error(error) {
      // Expected once the JWT outlives the Kompassi access token; the user simply signs in again.
      if (error.name === "JWTSessionError") return;
      console.error(error);
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

export const { handlers, auth } = NextAuth(config);
