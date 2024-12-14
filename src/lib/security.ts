import { db } from "./db"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

// Tipos de eventos de segurança
export enum SecurityEventType {
  LOGIN_ATTEMPT = "LOGIN_ATTEMPT",
  REGISTER_ATTEMPT = "REGISTER_ATTEMPT",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
}

// Níveis de severidade
export enum SecuritySeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

// Interface para detalhes do evento
interface SecurityEventDetails {
  email?: string
  path?: string
  error?: string
  attempts?: number
  [key: string]: any
}

// Função para logging de eventos de segurança
export async function logSecurityEvent(
  type: SecurityEventType,
  severity: SecuritySeverity,
  details: SecurityEventDetails
) {
  const headersList = headers()
  const ip = headersList.get("x-forwarded-for") || "unknown"
  const userAgent = headersList.get("user-agent")

  try {
    await db.securityLog.create({
      data: {
        type,
        severity,
        ip,
        userAgent: userAgent || undefined,
        details: JSON.stringify(details),
      },
    })

    // Se for uma atividade suspeita de alta severidade, verifica se deve bloquear o IP
    if (severity === SecuritySeverity.HIGH) {
      const recentLogs = await db.securityLog.count({
        where: {
          ip,
          severity: SecuritySeverity.HIGH,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // últimas 24 horas
          },
        },
      })

      if (recentLogs >= 5) {
        await blockIP(ip, "Múltiplas atividades suspeitas de alta severidade")
      }
    }
  } catch (error) {
    console.error("Erro ao registrar evento de segurança:", error)
  }
}

// Função para bloquear um IP
export async function blockIP(ip: string, reason: string, permanent: boolean = false) {
  try {
    await db.blockedIP.create({
      data: {
        ip,
        reason,
        isPermanent: permanent,
        expiresAt: permanent ? null : new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas se não for permanente
      },
    })
  } catch (error) {
    console.error("Erro ao bloquear IP:", error)
  }
}

// Middleware para verificar IPs bloqueados
export async function checkBlockedIP(ip: string): Promise<boolean> {
  try {
    const blockedIP = await db.blockedIP.findFirst({
      where: {
        ip,
        OR: [
          { isPermanent: true },
          { expiresAt: { gt: new Date() } },
        ],
      },
    })

    return !!blockedIP
  } catch (error) {
    console.error("Erro ao verificar IP bloqueado:", error)
    return false
  }
}

// Função para proteção contra timing attacks
export async function timingSafeEqual(userInput: string, storedValue: string): Promise<boolean> {
  if (typeof userInput !== "string" || typeof storedValue !== "string") {
    return false
  }

  const userBuffer = Buffer.from(userInput)
  const storedBuffer = Buffer.from(storedValue)

  if (userBuffer.length !== storedBuffer.length) {
    // Ainda fazemos a comparação para manter o timing constante
    const dummy = Buffer.alloc(userBuffer.length)
    return Buffer.compare(dummy, userBuffer) === 0
  }

  return Buffer.compare(userBuffer, storedBuffer) === 0
}

// Middleware de segurança
export async function securityMiddleware(request: Request) {
  const headersList = headers()
  const ip = headersList.get("x-forwarded-for") || "unknown"

  // Verifica se o IP está bloqueado
  const isBlocked = await checkBlockedIP(ip)
  if (isBlocked) {
    return NextResponse.json(
      { error: "Access denied" },
      { status: 403 }
    )
  }

  return null // Continua com a requisição
}
