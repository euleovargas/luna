import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    console.log('[VERIFY] Iniciando:', { token });

    if (!token) {
      console.log('[VERIFY] Token não fornecido');
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 400 }
      );
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
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VERIFY] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao verificar email" },
      { status: 500 }
    );
  }
}
