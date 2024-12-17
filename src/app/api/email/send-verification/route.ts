import { NextResponse } from "next/server"
import { sendVerificationEmail } from "@/lib/mail"
import { z } from "zod"

const sendVerificationSchema = z.object({
  email: z.string().email(),
  token: z.string(),
})

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, token } = sendVerificationSchema.parse(body)

    await sendVerificationEmail({ email, token })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      )
    }

    console.error("[SEND_VERIFICATION]", error)
    return NextResponse.json(
      { error: "Erro ao enviar email" },
      { status: 500 }
    )
  }
}
