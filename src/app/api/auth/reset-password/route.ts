import { db } from "@/lib/db"
import { verifyJwt } from "@/lib/jwt"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8), // Validação básica aqui, a validação completa já foi feita no frontend
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validação do schema
    try {
      resetPasswordSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Dados inválidos" },
          { status: 400 }
        )
      }
      throw error
    }

    const { token, password } = body

    // Verificação do token
    const payload = verifyJwt(token)
    console.log("Token payload:", payload) // Debug

    if (!payload) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 400 }
      )
    }

    if (!payload.resetPassword) {
      return NextResponse.json(
        { error: "Token não autorizado para redefinição de senha" },
        { status: 400 }
      )
    }

    // Verificação do usuário
    const user = await db.user.findUnique({
      where: { id: payload.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Hash da senha e atualização
    const hashedPassword = await bcrypt.hash(password, 12)

    await db.user.update({
      where: { id: payload.id },
      data: { 
        password: hashedPassword,
        emailVerified: new Date() // Marcar email como verificado
      },
    })

    return NextResponse.json({
      message: "Senha alterada com sucesso",
    })
  } catch (error) {
    console.error("[RESET_PASSWORD] Erro detalhado:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
