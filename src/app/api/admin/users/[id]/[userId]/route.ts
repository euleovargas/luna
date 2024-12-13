import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

const routeContextSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
})

const userUpdateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum([UserRole.ADMIN, UserRole.USER]),
})

export async function PUT(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Validar contexto da rota
    const { params } = routeContextSchema.parse(context)

    // Validar corpo da requisição
    const json = await req.json()
    const body = userUpdateSchema.parse(json)

    // Verificar se o usuário existe
    const existingUser = await db.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Verificar se o email já está em uso por outro usuário
    if (body.email !== existingUser.email) {
      const emailExists = await db.user.findUnique({
        where: { email: body.email },
      })

      if (emailExists) {
        return new NextResponse("Email already exists", { status: 400 })
      }
    }

    // Atualizar usuário
    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
      },
    })

    return NextResponse.json({
      user: updatedUser,
      success: true,
    })
  } catch (error) {
    console.error("[USER_UPDATE]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }

    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
