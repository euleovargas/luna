import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"
import { z } from "zod"

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

    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log("[REGISTER] Email já existe:", { email })
      return NextResponse.json(
        { error: "Email já está em uso" },
        { status: 400 }
      )
    }

    console.log("[REGISTER] Criando usuário:", { email })
    const user = await db.user.create({
      data: {
        email,
        name,
      }
    })

    const verificationToken = generateVerificationToken()
    console.log("[REGISTER] Token gerado:", { 
      tokenLength: verificationToken.length,
      emailToVerify: email 
    })

    // Atualiza o usuário com o token de verificação
    await db.user.update({
      where: { id: user.id },
      data: {
        verifyToken: verificationToken,
        lastEmailSent: new Date()
      }
    })

    console.log("[REGISTER] Usuário atualizado com token:", { 
      userId: user.id,
      email,
      tokenLength: verificationToken.length,
      lastEmailSent: new Date()
    })

    // Enviando email de forma síncrona
    await sendVerificationEmail({
      email,
      token: verificationToken
    })

    console.log("[REGISTER] Registro concluído com sucesso:", { email })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[REGISTER]", error)
    return NextResponse.json(
      { error: "Erro ao registrar usuário" },
      { status: 500 }
    )
  }
}
