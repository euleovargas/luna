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

    if (!user) {
      // Retornamos sucesso mesmo se o usuário não existir para evitar enumeração de emails
      return NextResponse.json({
        message: "Se o email existir, você receberá um link para redefinir sua senha",
      })
    }

    // Gera token de recuperação de senha
    const token = signJwtAccessToken({
      id: user.id,
      email: user.email,
      resetPassword: true,
    })

    // Envia email com link de recuperação
    await sendPasswordResetEmail({
      email,
      token,
    })

    return NextResponse.json({
      message: "Se o email existir, você receberá um link para redefinir sua senha",
    })
  } catch (error) {
    console.error("[FORGOT_PASSWORD]", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
