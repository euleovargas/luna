import { UserRole } from "@prisma/client"

export interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: UserRole
  createdAt: string
  emailVerified?: Date | null
}
