"use client"

import { LoginForm } from "@/components/auth/login-form"
import { useSearchParams } from "@/hooks/use-search-params"
import { useToast } from "@/components/ui/use-toast"
import { useEffect } from "react"

export function LoginPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const success = searchParams.get("success")
  const error = searchParams.get("error")

  useEffect(() => {
    if (success === "email_verified") {
      toast({
        title: "Email verificado!",
        description: "Sua conta foi ativada com sucesso. Você já pode fazer login.",
      })
    }

    // Tratamento de erros de verificação
    if (error) {
      const errorMessages: Record<string, { title: string; description: string }> = {
        missing_token: {
          title: "Link inválido",
          description: "O link de verificação está incompleto. Por favor, use o link mais recente enviado ao seu email.",
        },
        invalid_token: {
          title: "Link expirado",
          description: "Este link de verificação não é mais válido. Use o link mais recente enviado ao seu email ou solicite um novo.",
        },
        token_expired: {
          title: "Link expirado",
          description: "Este link de verificação expirou. Por favor, solicite um novo link.",
        },
        unknown: {
          title: "Erro inesperado",
          description: "Ocorreu um erro ao verificar seu email. Por favor, tente novamente mais tarde.",
        }
      }

      const message = errorMessages[error]
      if (message) {
        toast({
          title: message.title,
          description: message.description,
          variant: "destructive",
        })
      }
    }
  }, [success, error, toast])

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-indigo-400" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Luna
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Comece agora com Luna.
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
