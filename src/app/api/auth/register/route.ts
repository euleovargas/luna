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

    await db.verificationToken.create({
      data: {
        email,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    })

    // Enviando email de forma síncrona
    await sendVerificationEmail(
      verificationToken,
      email
    )

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
