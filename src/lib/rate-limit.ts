import rateLimit from 'express-rate-limit'
import { NextResponse } from 'next/server'

// Limite mais permissivo para registro (20 tentativas por hora)
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 tentativas
  message: 'Too many registration attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

// Limite moderado para reenvio de email (10 tentativas por hora)
export const emailResendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 tentativas
  message: 'Too many email resend attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

// Limite mais restritivo para tentativas de login (5 tentativas por 15 minutos)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

export function withRateLimit(handler: Function, limiterType: 'register' | 'email' | 'login' = 'login') {
  const limiter = {
    register: registerLimiter,
    email: emailResendLimiter,
    login: loginLimiter,
  }[limiterType]

  return async (request: Request) => {
    try {
      await new Promise((resolve, reject) => {
        limiter(
          { 
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            path: new URL(request.url).pathname 
          },
          {},
          (error: any) => {
            if (error) reject(error)
            resolve(true)
          }
        )
      })
      
      return handler(request)
    } catch (error) {
      const messages = {
        register: 'Muitas tentativas de registro. Por favor, tente novamente mais tarde.',
        email: 'Muitas tentativas de reenvio de email. Por favor, tente novamente mais tarde.',
        login: 'Muitas tentativas de login. Por favor, tente novamente mais tarde.',
      }

      return NextResponse.json(
        { error: messages[limiterType] },
        { status: 429 }
      )
    }
  }
}
