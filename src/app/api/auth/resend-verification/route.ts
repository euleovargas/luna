import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"
import { withRateLimit } from "@/lib/rate-limit"

export const POST = withRateLimit(async (req: Request) => {
  try {
    const { email } = await req.json()

    // Busca o usuário
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        emailVerified: true,
        verifyToken: true,
      },
    })

    // Se não existir usuário ou já estiver verificado
    if (!user) {
      return NextResponse.json(
        {
          error: "not_found",
          message: "Não encontramos uma conta com este email.",
        },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        {
          error: "already_verified",
          message: "Este email já está verificado. Você pode fazer login normalmente.",
        },
        { status: 400 }
      )
    }

    // Gera novo token e atualiza no banco
    const verifyToken = generateVerificationToken()
    await db.user.update({
      where: { id: user.id },
      data: { verifyToken },
    })

    // Envia novo email
    await sendVerificationEmail(email, verifyToken)

    return NextResponse.json({
      message: "Email de verificação reenviado com sucesso.",
    })
  } catch (error) {
    console.error("[RESEND_VERIFICATION_ERROR]", error)
    return NextResponse.json(
      { message: "Erro ao reenviar email de verificação." },
      { status: 500 }
    )
  }
})
