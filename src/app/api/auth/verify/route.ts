import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://luna-lemon.vercel.app';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    console.log('[VERIFY_EMAIL] Iniciando verificação:', { token })

    if (!token) {
      console.log('[VERIFY_EMAIL] Token não fornecido')
      const loginUrl = new URL("/login", APP_URL);
      loginUrl.searchParams.set("error", "missing_token");
      return NextResponse.redirect(loginUrl.toString());
    }

    // Busca o usuário pelo token
    const user = await db.user.findUnique({
      where: { verifyToken: token },
      select: {
        id: true,
        email: true,
        name: true,
        verifyToken: true,
        lastEmailSent: true,
      },
    });

    console.log('[VERIFY_EMAIL] Usuário encontrado:', { 
      found: !!user,
      email: user?.email,
      lastEmailSent: user?.lastEmailSent
    })

    if (!user) {
      const loginUrl = new URL("/login", APP_URL);
      loginUrl.searchParams.set("error", "invalid_token");
      return NextResponse.redirect(loginUrl.toString());
    }

    // Verifica se o token não expirou (24 horas)
    const tokenAge = user.lastEmailSent ? Date.now() - user.lastEmailSent.getTime() : Infinity;
    if (tokenAge > 24 * 60 * 60 * 1000) { // 24 horas em milissegundos
      console.log('[VERIFY_EMAIL] Token expirado:', { 
        tokenAge,
        maxAge: 24 * 60 * 60 * 1000
      })
      const loginUrl = new URL("/login", APP_URL);
      loginUrl.searchParams.set("error", "token_expired");
      return NextResponse.redirect(loginUrl.toString());
    }

    console.log('[VERIFY_EMAIL] Atualizando usuário:', { 
      userId: user.id,
      email: user.email
    })

    // Atualiza o usuário
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verifyToken: null,
        lastEmailSent: null,
      },
    });

    console.log('[VERIFY_EMAIL] Usuário verificado com sucesso')

    // Redireciona para a página de login com sucesso
    const loginUrl = new URL("/login", APP_URL);
    loginUrl.searchParams.set("success", "email_verified");
    return NextResponse.redirect(loginUrl.toString());
  } catch (error) {
    console.error("[VERIFY_EMAIL]", error);
    const loginUrl = new URL("/login", APP_URL);
    loginUrl.searchParams.set("error", "unknown");
    return NextResponse.redirect(loginUrl.toString());
  }
}
