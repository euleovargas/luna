"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"

interface ResendVerificationButtonProps {
  email: string
  lastEmailSent?: Date | null
}

export function ResendVerificationButton({ 
  email, 
  lastEmailSent 
}: ResendVerificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Calcula o tempo restante quando o componente monta
  useEffect(() => {
    if (lastEmailSent) {
      const now = new Date()
      const timeSinceLastEmail = now.getTime() - new Date(lastEmailSent).getTime()
      const waitTime = 60 * 1000 // 60 segundos
      const timeLeft = Math.max(0, waitTime - timeSinceLastEmail)
      
      setCountdown(Math.ceil(timeLeft / 1000))
    }
  }, [lastEmailSent])

  // Atualiza o contador a cada segundo
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((current) => Math.max(0, current - 1))
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [countdown])

  async function handleResend() {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao reenviar email")
      }

      // Atualiza o contador após reenvio bem-sucedido
      setCountdown(60)
    } catch (error) {
      console.error("[RESEND_VERIFICATION]", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      disabled={isLoading || countdown > 0}
      onClick={handleResend}
    >
      {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
      {countdown > 0 
        ? `Aguarde ${countdown}s para reenviar`
        : "Reenviar email de verificação"
      }
    </Button>
  )
}
