"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Icons } from "@/components/ui/icons"
import { signIn } from "next-auth/react"

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
import { passwordSchema, PasswordRules } from "./password-rules"

const registerSchema = z.object({
  name: z
    .string()
    .min(3, "O nome deve ter no mínimo 3 caracteres")
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]*$/, "O nome deve conter apenas letras"),
  email: z.string().email("Email inválido"),
  password: passwordSchema,
})

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isLoadingGoogle, setIsLoadingGoogle] = React.useState(false)
  const [password, setPassword] = React.useState("")
  const [showRules, setShowRules] = React.useState(false)

  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterValues) {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (!response.ok) {
        setIsLoading(false)
        
        // Se for conta não verificada, redireciona direto
        if (responseData.error === "unverified_account") {
          router.push(`/resend-verification?email=${encodeURIComponent(data.email)}`)
          return
        }

        // Se for erro de rate limit
        if (response.status === 429) {
          return toast({
            title: "Muitas tentativas",
            description: responseData.error || "Por favor, aguarde alguns minutos antes de tentar novamente.",
            variant: "destructive",
          })
        }

        return toast({
          title: "Erro ao criar conta",
          description: responseData.message || responseData.error || "Ocorreu um erro ao criar sua conta",
          variant: "destructive",
        })
      }
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para ativar sua conta",
      })
      
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
    } catch (error) {
      toast({
        title: "Erro ao criar conta",
        description:
          error instanceof Error ? error.message : "Ocorreu um erro ao criar sua conta",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    try {
      setIsLoadingGoogle(true)
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro ao fazer login com o Google",
        variant: "destructive",
      })
      setIsLoadingGoogle(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Criar conta</CardTitle>
        <CardDescription>
          Preencha os campos abaixo para criar sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome completo</Label>
            <div className="relative">
              <Icons.user className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Seu nome completo"
                type="text"
                autoCapitalize="words"
                autoComplete="name"
                autoCorrect="off"
                disabled={isLoading}
                className="pl-10"
                {...register("name")}
              />
            </div>
            {errors?.name && (
              <p className="text-sm font-medium text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Icons.mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                placeholder="seu@email.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                className="pl-10"
                {...register("email")}
              />
            </div>
            {errors?.email && (
              <p className="text-sm font-medium text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Icons.lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                disabled={isLoading}
                className="pl-10"
                {...register("password")}
                onChange={(e) => {
                  register("password").onChange(e)
                  setPassword(e.target.value)
                }}
                onFocus={() => setShowRules(true)}
              />
            </div>
            {errors?.password && (
              <p className="text-sm font-medium text-destructive">
                {errors.password.message}
              </p>
            )}
            <PasswordRules password={password} showRules={showRules} />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              "Criar conta"
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          type="button"
          disabled={isLoadingGoogle}
          onClick={loginWithGoogle}
        >
          {isLoadingGoogle ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <Icons.google className="mr-2 h-4 w-4" /> Entrar com Google
            </>
          )}
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center space-y-2">
        <div className="text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link
            aria-label="Sign in"
            href="/login"
            className="text-primary underline-offset-4 transition-colors hover:underline"
          >
            Entrar
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
