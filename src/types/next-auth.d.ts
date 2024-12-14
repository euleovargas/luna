import { UserRole } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"

interface LunaUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: UserRole
}

declare module "next-auth" {
  interface Session {
    user: LunaUser
  }

  interface User extends LunaUser {}
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
  }
}
