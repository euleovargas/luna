import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY não está configurada');
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Configurações de email
const EMAIL_FROM = 'Luna Platform <noreply@lpclass.com.br>';
const isDev = process.env.NODE_ENV === 'development';

// Email verificado no Resend para testes
const TEST_EMAIL = 'eu.leovargas@gmail.com';

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
          <p style="color: #666; font-size: 14px;">
            Se você está vendo este email, significa que o sistema de envio está funcionando corretamente.
          </p>
        </div>
      `,
    }).catch(error => {
      console.error('[TEST_EMAIL] Erro detalhado:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        response: error.response,
        statusCode: error?.statusCode,
      });
      throw error;
    });

    console.log('[TEST_EMAIL] Resposta da API:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('[TEST_EMAIL] Erro capturado:', {
      error,
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response,
      statusCode: error?.statusCode,
    });
    return { success: false, error };
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  // Em desenvolvimento, sempre envia para o email de teste
  const recipient = isDev ? TEST_EMAIL : email;
  const confirmLink = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;
  const timestamp = new Date().toISOString();
  
  console.log('[EMAIL] Configurações:', {
    from: EMAIL_FROM,
    to: recipient,
    originalEmail: email,
    confirmLink,
    apiKey: process.env.RESEND_API_KEY?.substring(0, 8) + '...',
    isDev,
    nextAuthUrl: process.env.NEXTAUTH_URL,
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
          <p style="color: #666; font-size: 14px;">
            Email enviado em: ${timestamp}
          </p>
        </div>
      `,
    }).catch(error => {
      console.error('[EMAIL] Erro detalhado:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        response: error.response,
        statusCode: error?.statusCode,
      });
      throw error;
    });

    console.log('[EMAIL] Resposta da API:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('[EMAIL] Erro capturado:', {
      error,
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response,
      statusCode: error?.statusCode,
    });
    return { success: false, error };
  }
};
