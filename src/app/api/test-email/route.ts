import { NextResponse } from "next/server"
import { sendTestEmail } from "@/lib/mail"

export const runtime = 'edge'
export const maxDuration = 10

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return new NextResponse(
        "Email é obrigatório",
        { status: 400 }
      )
    }

    const result = await sendTestEmail(email)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Erro ao enviar email de teste' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Email de teste enviado com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error("[TEST_EMAIL_ERROR]", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
