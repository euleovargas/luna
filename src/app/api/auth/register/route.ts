import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"
import { generateVerificationToken } from "@/lib/tokens"
import { z } from "zod"
import { Prisma } from "@prisma/client"

export const maxDuration = 30 // 30 segundos
export const dynamic = 'force-dynamic'

const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome muito longo"),
  email: z
    .string()
    .email("Email inválido"),
  password: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número")
    .regex(/[^A-Za-z0-9]/, "A senha deve conter pelo menos um caractere especial"),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = registerSchema.parse(json)

    const existingUser = await db.user.findUnique({
      where: { email: body.email },
      select: { id: true }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(body.password, 10)
    const verificationToken = await generateVerificationToken()

    const user = await db.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        verifyToken: verificationToken,
        lastEmailSent: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        verifyToken: true,
      },
    })

    // Envia email em uma rota separada para não bloquear o registro
    fetch('/api/email/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        token: user.verifyToken,
      }),
    }).catch(error => {
      console.error("[REGISTER] Erro ao chamar rota de email:", error)
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })

  } catch (error) {
    console.error("[REGISTER_ERROR]", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: "Email já cadastrado" },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: "Erro ao registrar usuário. Tente novamente mais tarde." },
      { status: 500 }
    )
  }
}
