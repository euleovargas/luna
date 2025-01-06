"use client"

import React, { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { Icons } from "@/components/ui/icons"

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
import { useSearchParams } from "@/hooks/use-search-params"
import { Checkbox } from "@/components/ui/checkbox"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)

  // Verificar token de verificação de email
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Se tiver um token de verificação, fazer login automático
      signIn("credentials", {
        token,
        callbackUrl: "/",
        redirect: false,
      }).then((response) => {
        if (response?.error) {
          console.error("[LOGIN_ERROR]", response.error);
          toast({
            title: "Erro ao fazer login",
            description: "Por favor, tente fazer login manualmente",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Email verificado com sucesso!",
            description: "Você foi conectado automaticamente",
          });
          router.push("/");
        }
      });
    }
  }, [searchParams, router, toast]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginValues) {
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Erro ao fazer login",
          description: "Credenciais inválidas",
          variant: "destructive",
        })
        return
      }

      // Se não houver erro, redireciona para a dashboard
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro inesperado",
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
        <CardTitle className="text-2xl">Bem-vindo</CardTitle>
        <CardDescription>
          Entre com sua conta para acessar a plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
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
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
                className="pl-10"
                {...register("password")}
              />
            </div>
            {errors?.password && (
              <p className="text-sm font-medium text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Lembrar de mim
              </label>
            </div>
            <Button
              variant="link"
              className="px-0 font-normal"
              size="sm"
              asChild
            >
              <Link href="/forgot-password">
                Esqueceu a senha?
              </Link>
            </Button>
          </div>
          <Button disabled={isLoading}>
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                Entrar
              </>
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
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Inscrever-se
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
