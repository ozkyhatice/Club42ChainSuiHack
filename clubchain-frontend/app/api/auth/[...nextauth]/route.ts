import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "42-school",
      name: "42",
      type: "oauth",
      authorization: {
        url: "https://api.intra.42.fr/oauth/authorize",
        params: { scope: "public" },
      },
      token: "https://api.intra.42.fr/oauth/token",
      userinfo: "https://api.intra.42.fr/v2/me",
      clientId: process.env.FORTYTWO_CLIENT_ID,
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.login,
          email: profile.email,
          image: profile.image?.link || null,
          intraId: profile.id,
          login: profile.login,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.intraId = (profile as any).id;
        token.login = (profile as any).login;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).intraId = token.intraId;
        (session.user as any).login = token.login;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

