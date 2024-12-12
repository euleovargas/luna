import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { z } from 'zod';
import { sendVerificationEmail } from '@/lib/mail';
import { randomBytes } from 'crypto';

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
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = registerSchema.parse(json);

    console.log('[REGISTER] Iniciando registro para:', body.email);

    // Verifica se o email já está em uso
    const existingUser = await db.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      console.log('[REGISTER] Email já em uso:', body.email);
      return NextResponse.json(
        { message: 'Este email já está em uso' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await hash(body.password, 12);

    // Gera token de verificação
    const verifyToken = randomBytes(32).toString('hex');

    console.log('[REGISTER] Criando usuário com token:', verifyToken);

    // Cria o usuário
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
    });

    console.log('[REGISTER] Usuário criado:', user);

    // Envia email de verificação
    const emailResult = await sendVerificationEmail(body.email, verifyToken);
    console.log('[REGISTER] Resultado do envio de email:', emailResult);

    if (!emailResult.success) {
      console.error('[REGISTER] Erro ao enviar email:', emailResult.error);
      return NextResponse.json(
        { message: 'Erro ao enviar email de verificação' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Usuário criado com sucesso', user },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('[REGISTER] Erro de validação:', error.errors);
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('[REGISTER_ERROR]', error);
    return NextResponse.json(
      { message: 'Algo deu errado ao criar sua conta' },
      { status: 500 }
    );
  }
}
