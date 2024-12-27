import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyJwt } from "@/lib/jwt";
import { z } from "zod";

const verifyEmailSchema = z.object({
  token: z.string(),
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://luna-lemon.vercel.app';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    console.log('[VERIFY] Iniciando:', { token });

    if (!token) {
      console.log('[VERIFY] Sem token');
      return NextResponse.redirect(`${APP_URL}/login?error=missing_token`);
    }

    // Busca todos os usuários não verificados
    const users = await db.user.findMany({
      where: { emailVerified: null },
      select: { id: true, email: true, verifyToken: true }
    });

    console.log('[VERIFY] Usuários não verificados:', users);

    // Encontra o usuário com o token
    const user = users.find(u => u.verifyToken === token);
    console.log('[VERIFY] Usuário encontrado:', user);

    if (!user) {
      console.log('[VERIFY] Token inválido');
      return NextResponse.redirect(`${APP_URL}/login?error=invalid_token`);
    }

    // Verifica o email
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verifyToken: null
      }
    });

    console.log('[VERIFY] Email verificado com sucesso');
    return NextResponse.redirect(`${APP_URL}/login?success=email_verified`);
  } catch (error) {
    console.error("[VERIFY] Erro:", error);
    return NextResponse.redirect(`${APP_URL}/login?error=unknown`);
  }
}
