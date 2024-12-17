import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ 
        error: "Email é obrigatório",
        tip: "Use ?email=seu@email.com na URL" 
      }, { status: 400 })
    }

    console.log('[TEST_VERIFY] Iniciando teste para:', { email })

    // Busca o usuário
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        emailVerified: true,
        verifyToken: true,
        lastEmailSent: true,
      },
    })

    console.log('[TEST_VERIFY] Usuário encontrado:', {
      found: !!user,
      emailVerified: user?.emailVerified,
      lastEmailSent: user?.lastEmailSent
    })

    if (!user) {
      return NextResponse.json({
        error: "Usuário não encontrado",
        email
      }, { status: 404 })
    }

    // Gera novo token
    const verifyToken = generateVerificationToken()
    console.log('[TEST_VERIFY] Token gerado:', { tokenLength: verifyToken.length })

    // Atualiza o token no banco
    await db.user.update({
      where: { id: user.id },
      data: { 
        verifyToken,
        lastEmailSent: new Date() 
      },
    })

    console.log('[TEST_VERIFY] Token atualizado no banco')

    // Envia o email
    console.log('[TEST_VERIFY] Enviando email...')
    await sendVerificationEmail({ 
      email, 
      token: verifyToken 
    })
    console.log('[TEST_VERIFY] Email enviado com sucesso')

    return NextResponse.json({
      success: true,
      message: "Email de verificação enviado com sucesso",
      details: {
        email,
        emailVerified: user.emailVerified,
        tokenLength: verifyToken.length
      }
    })

  } catch (error: any) {
    console.error('[TEST_VERIFY] Erro:', {
      error: error.message,
      code: error.code,
      name: error.name,
      statusCode: error.statusCode,
      response: error.response,
      stack: error.stack
    })

    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        code: error.code,
        name: error.name,
        statusCode: error.statusCode,
        response: error.response
      }
    }, { status: 500 })
  }
}
