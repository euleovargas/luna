import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"
import { withRateLimit } from "@/lib/rate-limit"
import { logSecurityEvent, SecurityEventType, SecuritySeverity } from "@/lib/security"

// Tempo mínimo entre envios de email (5 minutos)
const MIN_TIME_BETWEEN_EMAILS = 5 * 60 * 1000 // 5 minutos em milissegundos

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
        lastEmailSent: true,
      },
    })

    // Se não existir usuário ou já estiver verificado
    if (!user) {
      await logSecurityEvent(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        SecuritySeverity.MEDIUM,
        {
          email,
          error: "User not found - verification resend attempt"
        }
      )

      return NextResponse.json(
        {
          error: "not_found",
          message: "Não encontramos uma conta com este email.",
        },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      await logSecurityEvent(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        SecuritySeverity.LOW,
        {
          email,
          error: "Already verified - verification resend attempt"
        }
      )

      return NextResponse.json(
        {
          error: "already_verified",
          message: "Este email já está verificado. Você pode fazer login normalmente.",
        },
        { status: 400 }
      )
    }

    // Verifica o tempo desde o último envio
    if (user.lastEmailSent) {
      const timeSinceLastEmail = Date.now() - user.lastEmailSent.getTime()
      if (timeSinceLastEmail < MIN_TIME_BETWEEN_EMAILS) {
        const remainingTime = Math.ceil((MIN_TIME_BETWEEN_EMAILS - timeSinceLastEmail) / 1000 / 60)
        
        await logSecurityEvent(
          SecurityEventType.SUSPICIOUS_ACTIVITY,
          SecuritySeverity.LOW,
          {
            email,
            error: "Too many email requests",
            timeSinceLastEmail
          }
        )

        return NextResponse.json(
          {
            error: "too_many_requests",
            message: `Por favor, aguarde ${remainingTime} minutos antes de solicitar um novo email.`,
          },
          { status: 429 }
        )
      }
    }

    // Gera novo token e atualiza no banco
    const verifyToken = generateVerificationToken()
    await db.user.update({
      where: { id: user.id },
      data: { 
        verifyToken,
        lastEmailSent: new Date() 
      },
    })

    // Envia novo email
    await sendVerificationEmail(email, verifyToken)

    await logSecurityEvent(
      SecurityEventType.REGISTER_ATTEMPT,
      SecuritySeverity.LOW,
      {
        email,
        success: true,
        action: "verification_email_resent"
      }
    )

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )

  } catch (error) {
    await logSecurityEvent(
      SecurityEventType.REGISTER_ATTEMPT,
      SecuritySeverity.HIGH,
      {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      }
    )

    return NextResponse.json(
      { error: "Erro ao reenviar email de verificação" },
      { status: 500 }
    )
  }
}, 'email')
