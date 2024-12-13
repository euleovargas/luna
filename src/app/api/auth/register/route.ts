import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"
import { z } from "zod"
import { withRateLimit } from "@/lib/rate-limit"
import { logSecurityEvent, SecurityEventType, SecuritySeverity } from "@/lib/security"

const registerSchema = z.object({
  name: z
    .string()
    .min(3, "O nome deve ter no mínimo 3 caracteres")
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]*$/, "O nome deve conter apenas letras"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número")
    .regex(/[^A-Za-z0-9]/, "A senha deve conter pelo menos um caractere especial"),
})

export const POST = withRateLimit(async (req: Request) => {
  try {
    const json = await req.json()
    const body = registerSchema.parse(json)

    // Verifica se já existe um usuário com este email
    const existingUser = await db.user.findUnique({
      where: { email: body.email },
      select: {
        id: true,
        emailVerified: true,
        verifyToken: true,
        createdAt: true,
      },
    })

    // Se existir um usuário não verificado há mais de 24 horas, deletamos para permitir novo registro
    if (existingUser && !existingUser.emailVerified) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      
      if (existingUser.createdAt < twentyFourHoursAgo) {
        await db.user.delete({
          where: { id: existingUser.id }
        })
      } else {
        // Conta não verificada ainda dentro das 24 horas
        await logSecurityEvent(
          SecurityEventType.REGISTER_ATTEMPT,
          SecuritySeverity.MEDIUM,
          {
            email: body.email,
            error: "unverified_account",
          }
        )

        return NextResponse.json(
          {
            error: "unverified_account",
            message: "Já existe uma conta não verificada com este email. Verifique sua caixa de entrada ou solicite um novo email de verificação.",
          },
          { status: 400 }
        )
      }
    } else if (existingUser && existingUser.emailVerified) {
      // Conta já existe e está verificada
      await logSecurityEvent(
        SecurityEventType.REGISTER_ATTEMPT,
        SecuritySeverity.MEDIUM,
        {
          email: body.email,
          error: "email_exists",
        }
      )

      return NextResponse.json(
        {
          error: "email_exists",
          message: "Este email já está em uso.",
        },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(body.password, 12)
    const verifyToken = generateVerificationToken()

    const user = await db.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        verifyToken,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    // Envia email de verificação
    await sendVerificationEmail(body.email, verifyToken)

    // Log registro bem-sucedido
    await logSecurityEvent(
      SecurityEventType.REGISTER_ATTEMPT,
      SecuritySeverity.LOW,
      {
        email: body.email,
        success: true
      }
    )

    return NextResponse.json(
      { message: "Usuário criado com sucesso", user },
      { status: 201 }
    )
  } catch (error) {
    // Log erro no registro
    await logSecurityEvent(
      SecurityEventType.REGISTER_ATTEMPT,
      SecuritySeverity.HIGH,
      {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      }
    )

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos", errors: error.errors },
        { status: 400 }
      )
    }

    console.error("[REGISTER_ERROR]", error)
    return NextResponse.json(
      { message: "Algo deu errado ao criar sua conta" },
      { status: 500 }
    )
  }
})
