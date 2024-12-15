import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      const loginUrl = new URL("/login", process.env.NEXTAUTH_URL);
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

    if (!user) {
      const loginUrl = new URL("/login", process.env.NEXTAUTH_URL);
      loginUrl.searchParams.set("error", "invalid_token");
      return NextResponse.redirect(loginUrl.toString());
    }

    // Verifica se o token não expirou (24 horas)
    const tokenAge = user.lastEmailSent ? Date.now() - user.lastEmailSent.getTime() : Infinity;
    if (tokenAge > 24 * 60 * 60 * 1000) { // 24 horas em milissegundos
      const loginUrl = new URL("/login", process.env.NEXTAUTH_URL);
      loginUrl.searchParams.set("error", "token_expired");
      return NextResponse.redirect(loginUrl.toString());
    }

    // Atualiza o usuário
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verifyToken: null,
        lastEmailSent: null,
      },
    });

    // Redireciona para a página de login com sucesso
    const loginUrl = new URL("/login", process.env.NEXTAUTH_URL);
    loginUrl.searchParams.set("success", "email_verified");
    return NextResponse.redirect(loginUrl.toString());
  } catch (error) {
    console.error("[VERIFY_EMAIL]", error);
    const loginUrl = new URL("/login", process.env.NEXTAUTH_URL);
    loginUrl.searchParams.set("error", "unknown");
    return NextResponse.redirect(loginUrl.toString());
  }
}
