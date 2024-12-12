import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email não fornecido" },
        { status: 400 }
      );
    }

    // Busca o usuário
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email já foi verificado" },
        { status: 400 }
      );
    }

    // Gera novo token
    const verifyToken = randomBytes(32).toString("hex");

    // Atualiza o token do usuário
    await db.user.update({
      where: { id: user.id },
      data: { verifyToken },
    });

    // Envia o email
    const emailResult = await sendVerificationEmail(email, verifyToken);

    if (!emailResult.success) {
      return NextResponse.json(
        { message: "Erro ao enviar email de verificação" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Email de verificação reenviado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[RESEND_VERIFICATION_ERROR]", error);
    return NextResponse.json(
      { message: "Erro ao reenviar email de verificação" },
      { status: 500 }
    );
  }
}
