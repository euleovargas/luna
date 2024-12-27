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
      where: { verifyToken: token },
      select: {
        id: true,
        email: true,
        verifyToken: true,
        emailVerified: true
      }
    });

    console.log('[VERIFY] Busca:', { 
      token,
      encontrado: !!user,
      email: user?.email,
      tokenSalvo: user?.verifyToken,
      jaVerificado: !!user?.emailVerified
    });

    if (!user) {
      console.log('[VERIFY] Token inválido');
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 400 }
      );
    }

    // Se já foi verificado, retorna erro
    if (user.emailVerified) {
      console.log('[VERIFY] Email já verificado:', {
        email: user.email,
        verificadoEm: user.emailVerified
      });
      return NextResponse.json(
        { error: "Email já foi verificado" },
        { status: 400 }
      );
    }

    // Verifica o email
    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verifyToken: null
      },
      select: {
        id: true,
        email: true,
        emailVerified: true
      }
    });

    console.log('[VERIFY] Email verificado:', { 
      email: updated.email,
      verificadoEm: updated.emailVerified
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VERIFY] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao verificar email" },
      { status: 500 }
    );
  }
}
