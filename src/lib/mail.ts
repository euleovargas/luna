import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://luna-lemon.vercel.app';
const EMAIL_FROM = 'Luna <noreply@lpclass.com.br>';

interface SendVerificationEmailParams {
  email: string;
  token: string;
}

interface SendPasswordResetEmailParams {
  email: string;
  token: string;
}

/**
 * Envia um email de verificação
 */
export async function sendVerificationEmail({ email, token }: SendVerificationEmailParams) {
  const verificationLink = `${APP_URL}/auth/verify?token=${token}`;
  
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

/**
 * Envia um email de teste
 */
export async function sendTestEmail(to: string) {
  try {
    console.log('[EMAIL] Enviando teste:', { to });

    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Teste Luna',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Email de Teste</h1>
          <p>Este é um email de teste da Luna.</p>
          <p>Data: ${new Date().toISOString()}</p>
        </div>
      `
    });

    console.log('[EMAIL] Teste enviado com sucesso:', { to });
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erro ao enviar teste:', error);
    return { success: false, error };
  }
}

/**
 * Envia um email de redefinição de senha
 */
export async function sendPasswordResetEmail({ email, token }: SendPasswordResetEmailParams) {
  const resetLink = `${APP_URL}/reset-password?token=${token}`;
  
  console.log('[EMAIL] Enviando redefinição:', {
    to: email,
    token,
    link: resetLink
  });

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Redefinir sua senha na Luna',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Redefinir Senha</title>
            <meta charset="utf-8" />
          </head>
          <body>
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1>Redefinir sua senha</h1>
              <p>Você solicitou a redefinição de senha. Clique no botão abaixo:</p>
              <a href="${resetLink}" 
                 style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">
                Redefinir Senha
              </a>
              <p style="margin-top: 20px;">
                Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                <span style="color: #666;">${resetLink}</span>
              </p>
              <p style="color: #666; margin-top: 30px;">
                Se você não solicitou a redefinição de senha, ignore este email.
              </p>
            </div>
          </body>
        </html>
      `
    });

    console.log('[EMAIL] Redefinição enviada com sucesso:', { email });
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erro ao enviar redefinição:', error);
    return { success: false, error };
  }
}
