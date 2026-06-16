import { DefaultSession } from "next-auth";
import { GlobalRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      globalRole: GlobalRole;
    } & DefaultSession["user"];
  }

  interface User {
    globalRole?: GlobalRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    globalRole?: GlobalRole;
  }
}
