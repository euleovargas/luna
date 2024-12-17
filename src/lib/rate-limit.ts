import { NextResponse } from 'next/server'
import { db } from './db'

// Verifica se estamos em desenvolvimento
const isDevelopment = process.env.NODE_ENV === 'development'

// Configurações de limite por tipo
const limitConfigs = {
  register: {
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 20, // 20 tentativas
    message: 'Muitas tentativas de registro. Por favor, tente novamente mais tarde.',
  },
  email: {
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // 10 tentativas
    message: 'Muitas tentativas de reenvio de email. Por favor, tente novamente mais tarde.',
  },
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas
    message: 'Muitas tentativas de login. Por favor, tente novamente mais tarde.',
  },
}

export function withRateLimit(
  handler: (req: Request) => Promise<Response>,
  limiterType: keyof typeof limitConfigs = 'login'
) {
  // Em desenvolvimento, retorna o handler direto sem rate limit
  if (isDevelopment) {
    return handler
  }

  return async (request: Request) => {
    try {
      const config = limitConfigs[limiterType]
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      const path = new URL(request.url).pathname
      const key = `${limiterType}:${ip}:${path}`

      // Busca tentativas recentes
      const attempts = await db.rateLimit.findMany({
        where: {
          key,
          timestamp: {
            gte: new Date(Date.now() - config.windowMs),
          },
        },
      })

      // Se excedeu o limite
      if (attempts.length >= config.max) {
        return NextResponse.json(
          { error: config.message },
          { status: 429 }
        )
      }

      // Registra nova tentativa
      await db.rateLimit.create({
        data: {
          key,
          timestamp: new Date(),
        },
      })

      // Limpa tentativas antigas
      await db.rateLimit.deleteMany({
        where: {
          key,
          timestamp: {
            lt: new Date(Date.now() - config.windowMs),
          },
        },
      })

      return handler(request)
    } catch (error) {
      console.error('[RATE_LIMIT] Erro:', error)
      return handler(request)
    }
  }
}
