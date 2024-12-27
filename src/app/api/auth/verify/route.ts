import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://luna-lemon.vercel.app';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    console.log('[VERIFY] Iniciando:', { token });

    if (!token) {
      console.log('[VERIFY] Token não fornecido');
      return NextResponse.redirect(`${APP_URL}/login?error=missing_token`);
    }

    // Busca o usuário pelo token
    const user = await db.user.findFirst({
      where: { 
        verifyToken: token,
        emailVerified: null
      }
    });

    console.log('[VERIFY] Busca:', { 
      token,
      encontrado: !!user,
      email: user?.email 
    });

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

    console.log('[VERIFY] Email verificado:', { email: user.email });
    return NextResponse.redirect(`${APP_URL}/login?success=email_verified`);
  } catch (error) {
    console.error("[VERIFY] Erro:", error);
    return NextResponse.redirect(`${APP_URL}/login?error=unknown`);
  }
}
