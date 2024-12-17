import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY não está configurada');
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Configurações de email
const EMAIL_FROM = 'Luna Platform <onboarding@resend.dev>';
const isDev = process.env.NODE_ENV === 'development';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://luna-lemon.vercel.app';

// Email verificado no Resend para testes
const TEST_EMAIL = 'eu.leovargas@gmail.com';

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
    console.log('[TEST_EMAIL] Configurações:', {
      from: EMAIL_FROM,
      to: recipient,
      apiKey: process.env.RESEND_API_KEY?.substring(0, 8) + '...',
      isDev,
      originalTo: to,
      timestamp
    });

    const data = await resend.emails.send({
      from: EMAIL_FROM,
      to: recipient,
      subject: `Teste Luna Platform [${timestamp}]`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Email de Teste - Luna Platform</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Este é um email de teste enviado em: ${timestamp}
          </p>
          ${isDev ? `<p style="color: red; text-align: center;">MODO DE DESENVOLVIMENTO - Email original: ${to}</p>` : ''}
        </div>
      `,
    });

    console.log('[TEST_EMAIL] Email enviado:', data);
    return { success: true };

  } catch (error) {
    console.error('[TEST_EMAIL] Erro ao enviar:', error);
    return { success: false, error };
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  // Em desenvolvimento, sempre envia para o email de teste
  const recipient = isDev ? TEST_EMAIL : email;
  const confirmLink = `${APP_URL}/auth/verify?token=${token}`;
  const timestamp = new Date().toISOString();
  
  console.log('[EMAIL] Configurações:', {
    from: EMAIL_FROM,
    to: recipient,
    originalEmail: email,
    confirmLink,
    apiKey: process.env.RESEND_API_KEY?.substring(0, 8) + '...',
    isDev,
    appUrl: APP_URL,
    timestamp
  });

  try {
    const data = await resend.emails.send({
      from: EMAIL_FROM,
      to: recipient,
      subject: `Verificação Luna Platform [${timestamp}]`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Bem-vindo à Luna!</h2>
          ${isDev ? `<p style="color: red; text-align: center;">MODO DE DESENVOLVIMENTO - Email original: ${email}</p>` : ''}
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Obrigado por se cadastrar. Para começar a usar a Luna, por favor confirme seu email clicando no botão abaixo:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmLink}" 
               style="background-color: #0070f3; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verificar Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Se você não criou uma conta na Luna, pode ignorar este email.
          </p>
          <p style="color: #666; font-size: 14px;">
            Se o botão não funcionar, copie e cole este link no seu navegador:<br>
            <a href="${confirmLink}" style="color: #0070f3; word-break: break-all;">
              ${confirmLink}
            </a>
          </p>
        </div>
      `,
    });

    console.log('[EMAIL] Email enviado:', data);
    return { success: true };

  } catch (error) {
    console.error('[EMAIL] Erro ao enviar:', error);
    return { success: false, error };
  }
};

export const sendPasswordResetEmail = async ({ email, token }: SendPasswordResetEmailParams) => {
  // Em desenvolvimento, sempre envia para o email de teste
  const recipient = isDev ? TEST_EMAIL : email;
  const resetLink = `${APP_URL}/auth/reset?token=${token}`;
  const timestamp = new Date().toISOString();

  try {
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

    console.log('[PASSWORD_RESET] Email enviado:', data);
    return { success: true };

  } catch (error) {
    console.error('[PASSWORD_RESET] Erro ao enviar:', error);
    return { success: false, error };
  }
};
