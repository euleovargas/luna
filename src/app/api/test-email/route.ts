import { NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    console.log('[TEST_ROUTE] Tentando enviar email de teste para:', email);
    
    const result = await sendTestEmail(email);
    
    if (!result.success) {
      console.error('[TEST_ROUTE] Erro ao enviar email:', result.error);
      return NextResponse.json(
        { message: 'Erro ao enviar email de teste', error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Email de teste enviado com sucesso', data: result.data },
      { status: 200 }
    );
  } catch (error) {
    console.error('[TEST_ROUTE] Erro:', error);
    return NextResponse.json(
      { message: 'Erro ao processar requisição', error },
      { status: 500 }
    );
  }
}
