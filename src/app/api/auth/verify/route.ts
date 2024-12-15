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
        verifyTokenExpiry: true,
      },
    });

    if (!user) {
      const loginUrl = new URL("/login", process.env.NEXTAUTH_URL);
      loginUrl.searchParams.set("error", "invalid_token");
      return NextResponse.redirect(loginUrl.toString());
    }

    if (!user.verifyTokenExpiry || user.verifyTokenExpiry < new Date()) {
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
        verifyTokenExpiry: null,
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
