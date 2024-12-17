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
          // A API já redireciona para login, não precisamos fazer nada aqui
          if (!response.ok) {
            throw new Error("Falha ao verificar email")
          }
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
  }, [token, toast])

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
    <div className="flex flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Icons.mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verifique seu email</CardTitle>
          <CardDescription className="text-center">
            {email ? (
              <>
                Enviamos um link de verificação para <span className="font-medium">{email}</span>.
                Por favor, verifique sua caixa de entrada.
              </>
            ) : (
              "Enviamos um link de verificação para o seu email. Por favor, verifique sua caixa de entrada."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Não recebeu o email? Verifique sua pasta de spam ou solicite um novo link.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
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
        </CardFooter>
      </Card>
    </div>
  )
}
