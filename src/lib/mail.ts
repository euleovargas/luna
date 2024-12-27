import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error('[MAIL_CONFIG] RESEND_API_KEY não está configurada');
  throw new Error('RESEND_API_KEY não está configurada');
}

const resend = new Resend(RESEND_API_KEY);

// Configurações de email
const EMAIL_FROM = 'Luna <noreply@lpclass.com.br>';
const isDev = process.env.NODE_ENV === 'development';
const APP_URL = isDev ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_APP_URL || 'https://luna-lemon.vercel.app';

// Email verificado no Resend para testes
const TEST_EMAIL = 'contato@leovargas.com.br';

interface SendVerificationEmailParams {
  email: string;
  token: string;
}

interface SendPasswordResetEmailParams {
  email: string;
  token: string;
}

// Função de teste para enviar um email simples
export const sendTestEmail = async (to: string) => {
  // Em desenvolvimento, sempre envia para o email de teste
  const recipient = isDev ? TEST_EMAIL : to;
  const timestamp = new Date().toISOString();
  
  try {
    console.log('[TEST_EMAIL] Iniciando envio:', {
      from: EMAIL_FROM,
      to: recipient,
      apiKey: RESEND_API_KEY ? 'configurada' : 'não configurada',
      isDev,
      originalTo: to,
      timestamp,
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    });

    const data = await resend.emails.send({
      from: EMAIL_FROM,
      to: recipient,
      subject: `Teste Luna`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Email de Teste - Luna</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Este é um email de teste enviado em: ${timestamp}
          </p>
          ${isDev ? `<p style="color: red; text-align: center;">MODO DE DESENVOLVIMENTO - Email original: ${to}</p>` : ''}
        </div>
      `,
    });

    console.log('[TEST_EMAIL] Email enviado com sucesso:', {
      to: recipient,
      timestamp
    });
    
    return { success: true };

  } catch (error: any) {
    console.error('[TEST_EMAIL] Erro ao enviar:', {
      error: error.message,
      code: error.code,
      name: error.name,
      statusCode: error.statusCode,
      response: error.response,
      to: recipient,
      timestamp
    });
    return { success: false, error };
  }
};

export const sendVerificationEmail = async ({ email, token }: SendVerificationEmailParams) => {
  // Em desenvolvimento, sempre envia para o email de teste
  const recipient = isDev ? TEST_EMAIL : email;
  
  console.log('[VERIFICATION_EMAIL] Construindo link:', {
    isDev,
    APP_URL,
    token,
    baseUrl: `${APP_URL}/api/auth/verify`
  })

  const verificationLink = `${APP_URL}/api/auth/verify?token=${token}`;

  try {
    console.log('[VERIFICATION_EMAIL] Iniciando envio:', {
      to: recipient,
      link: verificationLink,
      token,
      isDev,
      tokenLength: token.length,
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      appUrl: APP_URL
    });

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: recipient,
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
              <h1 style="color: #333; text-align: center;">Bem-vindo à Luna!</h1>
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                Obrigado por se cadastrar. Para começar a usar sua conta, 
                precisamos verificar seu endereço de email.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}"
                   style="background-color: #0070f3; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Verificar Email
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">
                Se o botão não funcionar, você pode copiar e colar este link no seu navegador:
                <br>
                <a href="${verificationLink}" style="color: #0070f3; word-break: break-all;">
                  ${verificationLink}
                </a>
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                Este link expira em 24 horas. Se você não solicitou esta verificação, 
                pode ignorar este email com segurança.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('[VERIFICATION_EMAIL] Erro ao enviar:', error);
      throw error;
    }

    console.log('[VERIFICATION_EMAIL] Enviado com sucesso:', {
      id: data?.id,
      to: recipient,
    });

    return { success: true };
  } catch (error) {
    console.error('[VERIFICATION_EMAIL] Erro:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async ({ email, token }: SendPasswordResetEmailParams) => {
  // Em desenvolvimento, sempre envia para o email de teste
  const recipient = isDev ? TEST_EMAIL : email;
  const resetLink = `${APP_URL}/auth/reset?token=${token}`;
  const timestamp = new Date().toISOString();

  try {
    console.log('[RESET_EMAIL] Iniciando envio:', {
      from: EMAIL_FROM,
      to: recipient,
      originalEmail: email,
      resetLink,
      apiKey: RESEND_API_KEY ? 'configurada' : 'não configurada',
      isDev,
      appUrl: APP_URL,
      timestamp,
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    });

    const data = await resend.emails.send({
      from: EMAIL_FROM,
      to: recipient,
      subject: `Redefinir Senha - Luna Platform [${timestamp}]`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Redefinir sua senha</h2>
          ${isDev ? `<p style="color: red; text-align: center;">MODO DE DESENVOLVIMENTO - Email original: ${email}</p>` : ''}
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Você solicitou a redefinição de senha. Clique no botão abaixo para criar uma nova senha:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #0070f3; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              Redefinir Senha
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Se você não solicitou a redefinição de senha, pode ignorar este email.
          </p>
          <p style="color: #666; font-size: 14px;">
            Se o botão não funcionar, copie e cole este link no seu navegador:<br>
            <a href="${resetLink}" style="color: #0070f3; word-break: break-all;">
              ${resetLink}
            </a>
          </p>
        </div>
      `,
    });

    console.log('[RESET_EMAIL] Email enviado com sucesso:', {
      to: recipient,
      timestamp
    });
    
    return { success: true };

  } catch (error: any) {
    console.error('[RESET_EMAIL] Erro ao enviar:', {
      error: error.message,
      code: error.code,
      name: error.name,
      statusCode: error.statusCode,
      response: error.response,
      to: recipient,
      timestamp
    });
    return { success: false, error };
  }
};
