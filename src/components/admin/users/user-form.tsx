"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useTransition } from "react"
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
import { User } from "@/types/user"

const userFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "O nome deve ter pelo menos 2 caracteres.",
    })
    .max(30, {
      message: "O nome deve ter no máximo 30 caracteres.",
    }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  role: z.nativeEnum(UserRole, {
    required_error: "Por favor selecione um tipo de usuário.",
  }),
})

type UserFormValues = z.infer<typeof userFormSchema>

interface UserFormProps {
  user?: User
  onSubmit: (data: UserFormValues) => Promise<void>
}

export function UserForm({ user, onSubmit }: UserFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || UserRole.USER,
    },
  })

  async function handleSubmit(data: UserFormValues) {
    console.log("[USER_FORM] onSubmit called with data:", data)
    
    try {
      startTransition(() => {
        onSubmit(data)
          .then(() => {
            toast({
              title: "Usuário salvo",
              description: "As alterações foram salvas com sucesso.",
            })
          })
          .catch((error) => {
            console.error("[USER_FORM]", error)
            toast({
              title: "Erro ao salvar usuário",
              description: "Ocorreu um erro ao tentar salvar as alterações.",
              variant: "destructive",
            })
          })
      })
    } catch (error) {
      console.error("[USER_FORM]", error)
      toast({
        title: "Erro ao salvar usuário",
        description: "Ocorreu um erro ao tentar salvar as alterações.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome" {...field} />
              </FormControl>
              <FormDescription>
                Este é o nome que será exibido no perfil do usuário.
              </FormDescription>
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
                <Input placeholder="Digite o email" {...field} />
              </FormControl>
              <FormDescription>
                Este é o email que será usado para login.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Usuário</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.USER}>User</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Selecione o tipo de acesso que este usuário terá.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          {user ? "Salvar alterações" : "Criar usuário"}
        </Button>
      </form>
    </Form>
  )
}
