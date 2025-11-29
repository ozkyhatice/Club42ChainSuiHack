import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";

interface Profile42 {
  id: number;
  login: string;
  email: string;
  image?: {
    link: string;
  };
}

// Validate required environment variables
const FORTYTWO_CLIENT_ID = process.env.FORTYTWO_CLIENT_ID;
const FORTYTWO_CLIENT_SECRET = process.env.FORTYTWO_CLIENT_SECRET;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

// Only add 42 provider if credentials are configured
const providers = [];

if (FORTYTWO_CLIENT_ID && FORTYTWO_CLIENT_SECRET) {
  providers.push({
    id: "42-school",
    name: "42",
    type: "oauth" as const,
    authorization: {
      url: "https://api.intra.42.fr/oauth/authorize",
      params: { scope: "public" },
    },
    token: "https://api.intra.42.fr/oauth/token",
    userinfo: "https://api.intra.42.fr/v2/me",
    clientId: FORTYTWO_CLIENT_ID,
    clientSecret: FORTYTWO_CLIENT_SECRET,
    profile(profile: Profile42) {
      return {
        id: profile.id.toString(),
        name: profile.login,
        email: profile.email || "",
        image: profile.image?.link || null,
        intraId: profile.id,
        login: profile.login,
      };
    },
  });
} else if (process.env.NODE_ENV === "development") {
  console.warn(
    "⚠️  42 OAuth credentials not configured. Set FORTYTWO_CLIENT_ID and FORTYTWO_CLIENT_SECRET environment variables."
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const profile42 = profile as Profile42;
        token.intraId = profile42.id;
        token.login = profile42.login;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.intraId && token.login) {
        session.user.intraId = token.intraId;
        session.user.login = token.login;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: NEXTAUTH_SECRET || (process.env.NODE_ENV === "development" ? "dev-secret-change-in-production" : undefined),
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

