import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  try {
    console.log("[TEST_EMAIL_ROUTE] Iniciando teste com Resend")
    console.log("[TEST_EMAIL_ROUTE] API Key:", process.env.RESEND_API_KEY ? "Configurada" : "Não configurada")

    const data = await resend.emails.send({
      from: "Luna Platform <noreply@lpclass.com.br>",
      to: "eu.leovargas@gmail.com",
      subject: "Teste de Email Luna Platform",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Teste de Email - Luna Platform</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Este é um email de teste enviado em: ${new Date().toISOString()}
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Se você está vendo este email, significa que a configuração do Resend está funcionando corretamente.
          </p>
        </div>
      `,
    })

    console.log("[TEST_EMAIL_ROUTE] Email enviado com sucesso:", data)

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[TEST_EMAIL_ROUTE] Erro ao enviar email:", {
      error: error.message,
      code: error.code,
      name: error.name,
      statusCode: error.statusCode,
      response: error.response,
    })

    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: {
          code: error.code,
          name: error.name,
          statusCode: error.statusCode,
          response: error.response,
        }
      }, 
      { status: 500 }
    )
  }
}
