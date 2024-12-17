"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams as useNextSearchParams } from "next/navigation"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useNextSearchParams()
  const email = searchParams?.get("email")
  const token = searchParams?.get("token")
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  // Verifica o token quando a página carrega
  useEffect(() => {
    if (token) {
      setIsVerifying(true)
      fetch(`/api/auth/verify?token=${token}`)
        .then(async (response) => {
          // Se for redirecionamento, pegamos a URL
          if (response.redirected) {
            router.push(response.url)
            return
          }

          // Se não for redirecionamento mas também não for ok, é erro
          if (!response.ok) {
            throw new Error("Falha ao verificar email")
          }

          // Se chegou aqui deu tudo certo, redireciona para login
          router.push('/login?success=email_verified')
        })
        .catch((error) => {
          console.error("[VERIFY_EMAIL] Erro ao verificar:", error)
          toast({
            title: "Erro ao verificar email",
            description: "O link pode ter expirado ou ser inválido. Tente solicitar um novo link.",
            variant: "destructive",
          })
          setIsVerifying(false)
        })
    }
  }, [token, toast, router])

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Erro",
        description: "Email não encontrado. Por favor, tente fazer o registro novamente.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsResending(true)
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao reenviar email")
      }

      toast({
        title: "Email reenviado",
        description: "Verifique sua caixa de entrada.",
      })
    } catch (error) {
      console.error("[VERIFY_EMAIL] Erro ao reenviar:", error)
      toast({
        title: "Erro ao reenviar email",
        description: error instanceof Error 
          ? `${error.message} (${error.name})`
          : "Erro desconhecido ao reenviar email de verificação",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Icons.spinner className="h-6 w-6 text-primary animate-spin" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verificando seu email</CardTitle>
            <CardDescription>
              Por favor, aguarde enquanto verificamos seu email...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="bg-white rounded-lg p-8 shadow-lg">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="rounded-full bg-blue-50 p-3">
            <Icons.mail className="h-10 w-10 text-blue-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Verifique seu e-mail</h1>
            <p className="text-sm text-gray-500">
              Enviamos um link de verificação para o seu e-mail.
              <br />
              Por favor, verifique sua caixa de entrada e spam.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleResendVerification}
            disabled={isResending}
            className="w-full"
          >
            {isResending ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Reenviando...
              </>
            ) : (
              <>
                <Icons.refresh className="mr-2 h-4 w-4" />
                Reenviar email de verificação
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            asChild
            className="w-full"
          >
            <Link href="/login">Voltar para o login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
