import { User } from "next-auth"
import { JWT } from "next-auth/jwt"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: User & {
      id: string
      role: UserRole
    }
  }
}

export interface CustomSession {
  user: {
    id: string
    email: string
    name: string
    image: string | null
    role: UserRole
  }
  expires: string
}

export interface CustomToken extends JWT {
  sub: string
  role: UserRole
  image: string | null
}
