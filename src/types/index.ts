import { UserRole } from "@prisma/client"

export interface CustomSession {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: UserRole
  }
  expires: string
}
