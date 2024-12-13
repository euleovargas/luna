"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Icons } from "@/components/ui/icons"
import { passwordSchema, PasswordRules } from "./password-rules"

const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [showRules, setShowRules] = useState(false)

  const token = searchParams.get("token")

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: ResetPasswordValues) {
    if (!token) {
      toast({
        title: "Erro",
        description: "Token de recuperação inválido",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao redefinir senha")
      }

      toast({
        title: "Senha redefinida",
        description: "Sua senha foi alterada com sucesso",
      })

      router.push("/login")
    } catch (error) {
      console.error("Erro ao redefinir senha:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao redefinir sua senha",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Redefinir senha</CardTitle>
        <CardDescription>
          Digite sua nova senha
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">Nova senha</Label>
            <div className="relative">
              <Icons.lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                {...form.register("password")}
                onChange={(e) => {
                  form.register("password").onChange(e)
                  setPassword(e.target.value)
                }}
                onFocus={() => setShowRules(true)}
                type="password"
                placeholder="••••••••"
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            {form.formState.errors.password && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
            <PasswordRules password={password} showRules={showRules} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <div className="relative">
              <Icons.lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                {...form.register("confirmPassword")}
                type="password"
                placeholder="••••••••"
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Redefinir senha
          </Button>
        </CardFooter>
      </form>
      <div className="mt-4 text-center text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Voltar para o login
        </Link>
      </div>
    </Card>
  )
}
