import { UserRole } from "@prisma/client"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
    },
  })

  return users.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }))
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
    },
  })

  if (!user) {
    return null
  }

  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
  }
}

export async function createUser(data: {
  name: string
  email: string
  role: UserRole
  password: string
}) {
  // Hash da senha antes de salvar
  const hashedPassword = await bcrypt.hash(data.password, 10)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      password: hashedPassword,
      emailVerified: new Date(), // Como é criado pelo admin, já marcamos como verificado
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  })

  return user
}

export async function updateUser(
  id: string,
  data: {
    name: string
    email: string
    role: UserRole
  }
) {
  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  })

  return user
}

export async function deleteUser(id: string) {
  const user = await prisma.user.delete({
    where: { id },
  })

  return user
}
