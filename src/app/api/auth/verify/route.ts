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

    console.log('[VERIFY_EMAIL] Iniciando verificação:', { 
      token, // Temporário para debug
      tokenLength: token?.length,
      url: request.url,
      fullUrl: request.nextUrl.toString(),
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
      headers: Object.fromEntries(request.headers.entries())
    })

    if (!token) {
      console.log('[VERIFY_EMAIL] Token não fornecido')
      const loginUrl = new URL("/login", APP_URL);
      loginUrl.searchParams.set("error", "missing_token");
      return NextResponse.redirect(loginUrl.toString());
    }

    // Busca todos os usuários não verificados para debug
    const allUnverified = await db.user.findMany({
      where: { 
        emailVerified: null
      },
      select: {
        id: true,
        email: true,
        verifyToken: true,
        lastEmailSent: true
      }
    });

    console.log('[VERIFY_EMAIL] Todos usuários não verificados:', 
      allUnverified.map(u => ({
        email: u.email,
        token: u.verifyToken, // Temporário para debug
        tokenLength: u.verifyToken?.length,
        lastEmailSent: u.lastEmailSent
      }))
    );

    // Busca o usuário pelo token
    const user = await db.user.findFirst({
      where: { 
        verifyToken: {
          not: null,
          equals: token
        },
        emailVerified: null // Garante que só verifica usuários não verificados
      },
      select: {
        id: true,
        email: true,
        verifyToken: true,
        lastEmailSent: true
      },
    });

    console.log('[VERIFY_EMAIL] Resultado da busca:', { 
      found: !!user,
      email: user?.email,
      requestToken: token, // Temporário para debug
      userToken: user?.verifyToken, // Temporário para debug
      tokenMatch: user?.verifyToken === token,
      tokenLength: user?.verifyToken?.length,
      lastEmailSent: user?.lastEmailSent,
      now: new Date(),
      tokenAge: user?.lastEmailSent ? Date.now() - user.lastEmailSent.getTime() : null
    })

    if (!user || !user.verifyToken || user.verifyToken !== token) {
      console.log('[VERIFY_EMAIL] Token inválido')
      const loginUrl = new URL("/login", APP_URL);
      loginUrl.searchParams.set("error", "invalid_token");
      return NextResponse.redirect(loginUrl.toString());
    }

    if (!user.lastEmailSent) {
      console.log('[VERIFY_EMAIL] Data de envio não encontrada')
      const loginUrl = new URL("/login", APP_URL);
      loginUrl.searchParams.set("error", "invalid_token");
      return NextResponse.redirect(loginUrl.toString());
    }

    const tokenAge = Date.now() - user.lastEmailSent.getTime()
    const TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 horas

    if (tokenAge > TOKEN_EXPIRY) {
      console.log('[VERIFY_EMAIL] Token expirado')
      const loginUrl = new URL("/login", APP_URL);
      loginUrl.searchParams.set("error", "expired_token");
      return NextResponse.redirect(loginUrl.toString());
    }

    // Marca o email como verificado e limpa o token
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verifyToken: null,
      },
    });

    console.log('[VERIFY_EMAIL] Email verificado com sucesso:', { userId: user.id })

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
