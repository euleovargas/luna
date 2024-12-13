import { randomBytes } from "crypto"

/**
 * Gera um token aleatório para verificação de email
 * @returns string Token hexadecimal de 32 bytes
 */
export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex")
}

/**
 * Gera um token aleatório para redefinição de senha
 * @returns string Token hexadecimal de 32 bytes
 */
export function generatePasswordResetToken(): string {
  return randomBytes(32).toString("hex")
}

/**
 * Gera um token aleatório para autenticação de dois fatores
 * @returns string Token numérico de 6 dígitos
 */
export function generateTwoFactorToken(): string {
  return randomBytes(3).toString("hex").slice(0, 6).toUpperCase()
}
