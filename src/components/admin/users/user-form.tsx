"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { UserRole } from "@prisma/client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/ui/icons"

const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Digite um email válido.",
  }),
  role: z.enum([UserRole.ADMIN, UserRole.USER], {
    required_error: "Por favor selecione um tipo de usuário.",
  }),
  password: z.string().min(8, {
    message: "A senha deve ter pelo menos 8 caracteres.",
  }).optional().or(z.literal("")),
})

type UserFormValues = z.infer<typeof userFormSchema>

interface UserFormProps {
  user?: {
    id: string
    name: string
    email: string
    role: UserRole
    createdAt?: string
    image?: string | null
  }
}

export function UserForm({ user }: UserFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || UserRole.USER,
      password: "",
    },
  })

  React.useEffect(() => {
    console.log("[USER_FORM] Form errors:", form.formState.errors)
  }, [form.formState])

  async function onSubmit(data: UserFormValues) {
    console.log("[USER_FORM] onSubmit called with data:", data)
    setIsLoading(true)

    try {
      const isNewUser = !user?.id
      const url = isNewUser ? '/api/admin/users' : `/api/admin/users/${user.id}`
      const method = isNewUser ? 'POST' : 'PUT'

      console.log("[USER_FORM] Making request to:", url, "with method:", method)

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          role: data.role,
          ...(isNewUser && data.password ? { password: data.password } : {}),
        }),
        cache: 'no-store'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Algo deu errado")
      }

      const result = await response.json()
      console.log("[USER_FORM] Response:", result)

      toast({
        title: isNewUser ? "Usuário criado!" : "Usuário atualizado!",
        description: isNewUser 
          ? "O novo usuário foi criado com sucesso."
          : "As informações do usuário foram atualizadas.",
      })

      router.push("/admin/users")
      router.refresh()
    } catch (error) {
      console.error("[USER_FORM] Error:", error)
      toast({
        title: "Algo deu errado.",
        description: error instanceof Error ? error.message : "Erro ao processar a requisição.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          console.log("[USER_FORM] Form submitted")
          form.handleSubmit(onSubmit)(e)
        }} 
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do usuário" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@exemplo.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de usuário</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo de usuário" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={UserRole.USER}>Usuário</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {!user && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite uma senha"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A senha deve ter pelo menos 8 caracteres.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/users")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {user ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
