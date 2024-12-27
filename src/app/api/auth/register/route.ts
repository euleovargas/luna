import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"
import { z } from "zod"
import { hash } from "bcryptjs"

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, name, password } = registerSchema.parse(body)

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

    // Busca usuário com o mesmo token (não deveria existir)
    const existingToken = await db.user.findFirst({
      where: { verifyToken: token }
    });
    console.log('[REGISTER] Verificando token:', { 
      token,
      existe: !!existingToken 
    });

    // Hash da senha
    const hashedPassword = await hash(password, 10);

    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        verifyToken: token,
        lastEmailSent: new Date()
      },
      select: {
        id: true,
        email: true,
        verifyToken: true
      }
    })

    console.log('[REGISTER] Usuário criado:', { 
      userId: user.id, 
      email: user.email,
      token: user.verifyToken 
    });

    await sendVerificationEmail({ email, token });

    console.log('[REGISTER] Concluído com sucesso:', { email });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[REGISTER] Erro:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Erro ao registrar usuário" },
      { status: 500 }
    )
  }
}
