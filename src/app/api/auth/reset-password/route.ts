import { db } from "@/lib/db"
import { verifyJwt } from "@/lib/jwt"
import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, password } = resetPasswordSchema.parse(body)

    const payload = verifyJwt(token)

    if (!payload || !payload.resetPassword) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.user.update({
      where: { id: payload.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({
      message: "Senha alterada com sucesso",
    })
  } catch (error) {
    console.error("[RESET_PASSWORD]", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
