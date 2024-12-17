import { db } from "@/lib/db"
import { signJwtAccessToken } from "@/lib/jwt"
import { sendPasswordResetEmail } from "@/lib/mail"
import { NextResponse } from "next/server"
import { z } from "zod"

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = forgotPasswordSchema.parse(body)

    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user || !user.email) {
      // Retornamos sucesso mesmo se o usuário não existir para evitar enumeração de emails
      return NextResponse.json({
        message: "Se o email existir, você receberá um link para redefinir sua senha",
      })
    }

    // Gera token de recuperação de senha
    const token = signJwtAccessToken({
      id: user.id,
      email: user.email, // Agora sabemos que user.email não é null
      resetPassword: true,
    })

    // Envia email com link de recuperação
    await sendPasswordResetEmail({
      email: user.email,
      token,
    })

    return NextResponse.json({
      message: "Se o email existir, você receberá um link para redefinir sua senha",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Email inválido" },
        { status: 400 }
      )
    }

    console.error("[FORGOT_PASSWORD]", error)
    return NextResponse.json(
      { message: "Algo deu errado" },
      { status: 500 }
    )
  }
}
