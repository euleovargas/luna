import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

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
        emailVerified: true,
      },
    });

    // Se o token não existir ou o email já estiver verificado
    if (!user || user.emailVerified) {
      const loginUrl = new URL("/login", process.env.NEXTAUTH_URL);
      loginUrl.searchParams.set("error", "invalid_token");
      return NextResponse.redirect(loginUrl.toString());
    }

    // Atualiza o usuário como verificado
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verifyToken: null, // Remove o token após a verificação
      },
    });

    // Redireciona para a página de login com o parâmetro verified
    const loginUrl = new URL("/login", process.env.NEXTAUTH_URL);
    loginUrl.searchParams.set("verified", "true");
    
    return NextResponse.redirect(loginUrl.toString());
  } catch (error) {
    console.error("[VERIFY_ERROR]", error);
    const loginUrl = new URL("/login", process.env.NEXTAUTH_URL);
    loginUrl.searchParams.set("error", "server_error");
    return NextResponse.redirect(loginUrl.toString());
  }
}
