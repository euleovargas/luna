import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"
import { z } from "zod"

export const runtime = 'edge'

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    console.log("[REGISTER] Iniciando registro")
    const body = await req.json()
    const { email, name } = registerSchema.parse(body)

    console.log("[REGISTER] Verificando email:", { email })

    // Verifica se o email já está em uso
    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está em uso" },
        { status: 400 }
      )
    }

    // Gera um token de verificação
    const verifyToken = await generateVerificationToken()

    console.log("[REGISTER] Criando usuário:", { 
      email, 
      tokenLength: verifyToken.length 
    })

    // Cria o usuário
    const user = await db.user.create({
      data: {
        email,
        name,
        verifyToken,
        lastEmailSent: new Date(),
      },
    })

    console.log("[REGISTER] Usuário criado, enviando email:", {
      userId: user.id,
      email: user.email,
    })

    // Envia o email de verificação em background
    sendVerificationEmail({ 
      email: user.email!, 
      token: verifyToken 
    }).catch(error => {
      console.error("[REGISTER] Erro ao enviar email:", error)
    })

    return NextResponse.json({ 
      success: true,
      email: user.email
    })
  } catch (error) {
    console.error("[REGISTER]", error)
    return NextResponse.json(
      { error: "Erro ao registrar usuário" },
      { status: 500 }
    )
  }
}
