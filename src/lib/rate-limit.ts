import rateLimit from 'express-rate-limit'
import { NextResponse } from 'next/server'

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limite de 5 tentativas
  message: 'Too many attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

export function withRateLimit(handler: Function) {
  return async (request: Request) => {
    try {
      await new Promise((resolve, reject) => {
        rateLimiter(
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
      return NextResponse.json(
        { error: 'Too many requests, please try again later' },
        { status: 429 }
      )
    }
  }
}
