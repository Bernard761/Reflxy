import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";

import { prisma } from "@/lib/prisma";

const emailServer = process.env.EMAIL_SERVER ?? "smtp://localhost:1025";
const emailFrom = process.env.EMAIL_FROM ?? "no-reply@reflxy.app";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: emailServer,
      from: emailFrom,
    }),
  ],
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  session: {
    strategy: "database",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          status: "INACTIVE",
          tier: "FREE",
        },
      });
    },
  },
};
