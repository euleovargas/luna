import { UserRole } from "@prisma/client";
import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: UserRole
  }

  interface Session {
    user: User
  }
}
