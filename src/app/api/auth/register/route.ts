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

// Cache para armazenar as últimas tentativas de registro
const attempts = new Map<string, { count: number; timestamp: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 60 * 1000 // 1 minuto

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1"
    
    // Verifica o rate limit
    const now = Date.now()
    const userAttempts = attempts.get(ip)
    
    if (userAttempts) {
      // Limpa tentativas antigas
      if (now - userAttempts.timestamp > WINDOW_MS) {
        attempts.delete(ip)
      } else if (userAttempts.count >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: "Muitas tentativas. Tente novamente mais tarde." },
          { status: 429 }
        )
      }
    }

    const json = await req.json()
    const body = registerSchema.parse(json)

    // Incrementa o contador de tentativas
    attempts.set(ip, {
      count: (userAttempts?.count ?? 0) + 1,
      timestamp: now
    })

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
      return NextResponse.json(
        {
          error: "email_exists",
          message: "Este email já está em uso.",
        },
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
        verifyTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    // Envia email de verificação
    await sendVerificationEmail(
      verificationToken,
      body.email
    )

    return NextResponse.json({
      message: "Usuário criado com sucesso",
      user: {
        name: user.name,
        email: user.email,
      },
    },
    { status: 201 })

  } catch (error) {
    console.error("[REGISTER_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao registrar usuário" },
      { status: 500 }
    )
  }
}
