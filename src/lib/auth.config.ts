import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [], // Edge-compatible providers could go here
  callbacks: {
    async signIn({ user }) {
      if (user.id) {
        // We can't easily fetch db here because it's Edge compatible config,
        // But NextAuth will pass the user object.
        // We will enforce this in auth.ts
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.globalRole = user.globalRole || "USER";
        token.status = (user as any).status || "ACTIVE";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.globalRole = (token.globalRole as any) || "USER";
        (session.user as any).status = token.status as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
