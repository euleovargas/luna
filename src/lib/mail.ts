import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://luna-lemon.vercel.app';
const EMAIL_FROM = 'Luna <noreply@lpclass.com.br>';

interface SendVerificationEmailParams {
  email: string;
  token: string;
}

/**
 * Envia um email de verificação
 */
export async function sendVerificationEmail({ email, token }: SendVerificationEmailParams) {
  const verificationLink = `${APP_URL}/api/auth/verify?token=${token}`;
  
  console.log('[EMAIL] Enviando verificação:', {
    to: email,
    token,
    link: verificationLink
  });

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Verifique sua conta na Luna',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Verificação de Email</title>
            <meta charset="utf-8" />
          </head>
          <body>
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1>Bem-vindo à Luna!</h1>
              <p>Clique no botão abaixo para verificar seu email:</p>
              <a href="${verificationLink}" 
                 style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">
                Verificar Email
              </a>
              <p style="margin-top: 20px;">
                Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                <span style="color: #666;">${verificationLink}</span>
              </p>
              <p style="color: #666; margin-top: 30px;">
                Se você não criou uma conta na Luna, ignore este email.
              </p>
            </div>
          </body>
        </html>
      `
    });

    console.log('[EMAIL] Verificação enviada com sucesso:', { email });
  } catch (error) {
    console.error('[EMAIL] Erro ao enviar verificação:', error);
    throw error;
  }
}
