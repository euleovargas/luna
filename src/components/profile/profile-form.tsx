"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useTransition } from "react"

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
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/ui/icons"
import { User } from "@/types/user"
import { ProfileImage } from "@/components/profile/profile-image"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteProfile } from "@/app/_actions/profile"
import { signOut, useSession, update } from "next-auth/react"
import { useUserStore } from "@/store/user-store"

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "O nome deve ter pelo menos 2 caracteres.",
    })
    .max(30, {
      message: "O nome deve ter no máximo 30 caracteres.",
    }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  user?: User
  onSubmit: (data: ProfileFormValues) => Promise<void>
}

export function ProfileForm({ user, onSubmit }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const updateUser = useUserStore((state) => state.updateUser)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
    },
  })

  async function handleSubmit(data: ProfileFormValues) {
    console.log("[PROFILE_FORM] onSubmit called with data:", data)
    
    try {
      startTransition(() => {
        onSubmit(data)
          .then(() => {
            // Atualiza o estado global
            updateUser({ name: data.name })

            // Atualiza a sessão do NextAuth
            const session = {
              user: {
                name: data.name,
              },
            }
            update(session)

            toast({
              title: "Perfil atualizado",
              description: "As alterações foram salvas com sucesso.",
            })
          })
          .catch((error) => {
            console.error("[PROFILE_FORM]", error)
            toast({
              title: "Erro ao atualizar perfil",
              description: "Ocorreu um erro ao tentar salvar as alterações.",
              variant: "destructive",
            })
          })
      })
    } catch (error) {
      console.error("[PROFILE_FORM]", error)
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro ao tentar salvar as alterações.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteProfile()

      toast({
        title: "Conta deletada",
        description: "Sua conta foi deletada com sucesso.",
      })

      signOut({
        callbackUrl: "/",
      })
    } catch (error) {
      console.error("[PROFILE_DELETE]", error)
      toast({
        title: "Erro ao deletar conta",
        description: "Ocorreu um erro ao tentar deletar sua conta.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      <ProfileImage imageUrl={user?.image} name={user?.name} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Digite seu nome" {...field} />
                </FormControl>
                <FormDescription>
                  Este é o nome que será exibido no seu perfil.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              O email não pode ser alterado.
            </p>
          </div>

          <div className="flex justify-between items-center">
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salvar alterações
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-muted-foreground hover:text-destructive">
                  Excluir conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Sua conta será permanentemente excluída.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Excluir conta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </Form>
    </div>
  )
}
