"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

const resendSchema = z.object({
  email: z.string().email("Email inválido"),
})

type ResendValues = z.infer<typeof resendSchema>

export default function ResendVerificationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResendValues>({
    resolver: zodResolver(resendSchema),
  })

  // Se vier da página de registro, já preenche o email
  const emailFromRegister = searchParams.get("email")
  if (emailFromRegister) {
    setValue("email", emailFromRegister)
  }

  async function onSubmit(data: ResendValues) {
    if (cooldown > 0) {
      toast({
        variant: "destructive",
        title: "Aguarde",
        description: `Por favor, aguarde ${cooldown} minutos antes de solicitar um novo email.`,
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.status === 429) {
        // Too many requests - extrair o tempo restante da mensagem
        const minutes = parseInt(result.message.match(/\d+/)[0])
        setCooldown(minutes)
        
        // Iniciar countdown
        const interval = setInterval(() => {
          setCooldown((current) => {
            if (current <= 1) {
              clearInterval(interval)
              return 0
            }
            return current - 1
          })
        }, 60000) // atualiza a cada minuto

        toast({
          variant: "destructive",
          title: "Muitas tentativas",
          description: result.message,
        })
        return
      }

      if (!response.ok) {
        throw new Error(result.error || "Erro ao reenviar email")
      }

      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada e spam.",
      })

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao reenviar email",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Reenviar Email de Verificação</CardTitle>
        <CardDescription>
          {emailFromRegister
            ? "Um email de verificação já foi enviado para este endereço. Se não o encontrou, você pode solicitar um novo envio."
            : "Digite seu email para receber um novo link de verificação."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Input
                {...register("email")}
                placeholder="nome@exemplo.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading || cooldown > 0}
              />
              {errors?.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || cooldown > 0}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {cooldown > 0 ? (
              `Aguarde ${cooldown}min para reenviar`
            ) : (
              "Reenviar email de verificação"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
