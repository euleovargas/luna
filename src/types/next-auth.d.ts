import { UserRole } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
  }
}
