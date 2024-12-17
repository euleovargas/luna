import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"
import { z } from "zod"

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
    console.log("[REGISTER] Iniciando registro...")
    const json = await req.json()
    const body = registerSchema.parse(json)

    console.log("[REGISTER] Verificando usuário existente...")
    const existingUser = await db.user.findUnique({
      where: { email: body.email },
    })

    if (existingUser) {
      console.log("[REGISTER] Email já cadastrado:", body.email)
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      )
    }

    console.log("[REGISTER] Gerando hash da senha...")
    const hashedPassword = await hash(body.password, 10)
    const verificationToken = await generateVerificationToken()

    console.log("[REGISTER] Criando usuário...")
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

    // Envia email de verificação em background
    console.log("[REGISTER] Enviando email de verificação...")
    sendVerificationEmail(user.email, user.verifyToken as string)
      .catch(error => {
        console.error("[REGISTER] Erro ao enviar email:", error)
      })

    console.log("[REGISTER] Registro concluído com sucesso!")
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })

  } catch (error) {
    console.error("[REGISTER_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao registrar usuário" },
      { status: 500 }
    )
  }
}
