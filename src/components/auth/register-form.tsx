"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
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

const passwordRules = [
  {
    id: "minLength",
    label: "Pelo menos 8 caracteres",
    regex: /.{8,}/,
  },
  {
    id: "uppercase",
    label: "Uma letra maiúscula",
    regex: /[A-Z]/,
  },
  {
    id: "lowercase",
    label: "Uma letra minúscula",
    regex: /[a-z]/,
  },
  {
    id: "number",
    label: "Um número",
    regex: /[0-9]/,
  },
  {
    id: "special",
    label: "Um caractere especial",
    regex: /[^A-Za-z0-9]/,
  },
] as const

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número")
  .regex(
    /[^A-Za-z0-9]/,
    "A senha deve conter pelo menos um caractere especial"
  )

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
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const { toast } = useToast()
  const [password, setPassword] = React.useState("")
  const [showRules, setShowRules] = React.useState(false)

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

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao criar conta')
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

  const passwordRulesStatus = React.useMemo(() => {
    return passwordRules.map((rule) => ({
      ...rule,
      isValid: rule.regex.test(password),
    }))
  }, [password])

  const allRulesValid = passwordRulesStatus.every((rule) => rule.isValid)

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
            {showRules && (
              <div className="mt-2">
                
                <ul className="text-sm space-y-1">
                  {passwordRulesStatus.map((rule) => (
                    <li key={rule.id} className="flex items-center">
                      {rule.isValid ? (
                        <Icons.check className="mr-2 h-4 w-4 text-green-500" />
                      ) : (
                        <Icons.x className="mr-2 h-4 w-4 text-destructive text-gray-500" />
                      )}
                      <span className="text-muted-foreground">{rule.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {errors?.password && (
              <p className="text-sm font-medium text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button disabled={isLoading}>
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              <>
                Criar conta
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
          disabled={isLoading}
          onClick={() => router.push(`/api/auth/signin/google`)}
        >
          {isLoading ? (
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
          Já tem uma conta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Fazer login
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
