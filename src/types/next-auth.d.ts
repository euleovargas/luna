import { UserRole } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
    }
    expires: string
  }

  interface User extends DefaultUser {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: UserRole
  }
}
