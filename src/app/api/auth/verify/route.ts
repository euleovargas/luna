import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signJwtAccessToken } from "@/lib/jwt";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Token não fornecido" },
        { status: 400 }
      );
    }

    // Busca o usuário pelo token
    const user = await db.user.findUnique({
      where: { verifyToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Token inválido ou expirado" },
        { status: 400 }
      );
    }

    // Atualiza o usuário como verificado
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verifyToken: null, // Remove o token após a verificação
      },
    });

    // Redireciona para a página de login com um token especial
    const verificationToken = signJwtAccessToken({
      id: user.id,
      email: user.email,
      verified: true,
    });

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/login?token=${verificationToken}`
    );
  } catch (error) {
    console.error("[VERIFY_ERROR]", error);
    return NextResponse.json(
      { message: "Erro ao verificar email" },
      { status: 500 }
    );
  }
}
