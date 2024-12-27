import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, name } = registerSchema.parse(body)

    console.log('[REGISTER] Iniciando:', { email });

    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('[REGISTER] Email já existe:', { email });
      return NextResponse.json(
        { error: "Email já está em uso" },
        { status: 400 }
      )
    }

    const token = generateVerificationToken();
    console.log('[REGISTER] Token gerado:', { token });

    const user = await db.user.create({
      data: {
        email,
        name,
        verifyToken: token,
        lastEmailSent: new Date()
      }
    })

    console.log('[REGISTER] Usuário criado:', { 
      userId: user.id, 
      email,
      token 
    });

    await sendVerificationEmail({ email, token });

    console.log('[REGISTER] Concluído com sucesso:', { email });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[REGISTER] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao registrar usuário" },
      { status: 500 }
    )
  }
}
