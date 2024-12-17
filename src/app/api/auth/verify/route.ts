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

    console.log('[VERIFY_EMAIL] Iniciando verificação:', { token })

    if (!token) {
      console.log('[VERIFY_EMAIL] Token não fornecido')
      const loginUrl = new URL("/login", APP_URL);
      loginUrl.searchParams.set("error", "missing_token");
      return NextResponse.redirect(loginUrl.toString());
    }

    // Busca o usuário pelo token
    const user = await db.user.findFirst({
      where: { 
        verifyToken: token,
        emailVerified: null // Garante que só verifica usuários não verificados
      },
      select: {
        id: true,
        email: true,
        verifyToken: true,
      },
    });

    console.log('[VERIFY_EMAIL] Usuário encontrado:', { 
      found: !!user,
      email: user?.email,
    })

    if (!user || !user.verifyToken || user.verifyToken !== token) {
      console.log('[VERIFY_EMAIL] Token inválido ou expirado')
      const loginUrl = new URL("/login", APP_URL);
      loginUrl.searchParams.set("error", "invalid_token");
      return NextResponse.redirect(loginUrl.toString());
    }

    // Verifica se o token é o mais recente
    const latestUser = await db.user.findUnique({
      where: { id: user.id },
      select: { 
        verifyToken: true,
        lastEmailSent: true
      }
    })

    if (!latestUser || latestUser.verifyToken !== token) {
      console.log('[VERIFY_EMAIL] Token não é o mais recente')
      const loginUrl = new URL("/login", APP_URL);
      loginUrl.searchParams.set("error", "invalid_token");
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
