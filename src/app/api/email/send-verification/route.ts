import { NextResponse } from "next/server"
import { sendVerificationEmail } from "@/lib/mail"

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json()

    await sendVerificationEmail(email, token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[EMAIL_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao enviar email" },
      { status: 500 }
    )
  }
}
