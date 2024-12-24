'use client'

import * as React from "react"
import { useState, useTransition } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
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
import { useSession, signOut } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useUploadThing } from "@/lib/uploadthing"
import { useDropzone } from "react-dropzone"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const profileFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [isUploading, setIsUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { startUpload } = useUploadThing("imageUploader")

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: session?.user?.name || "",
    },
  })

  // Atualiza o formulário quando a sessão mudar
  React.useEffect(() => {
    if (session?.user?.name) {
      form.reset({ name: session.user.name })
    }
  }, [session, form])

  async function onSubmit(data: ProfileFormValues) {
    try {
      startTransition(async () => {
        const response = await fetch("/api/user/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error("Falha ao atualizar perfil")
        }

        const result = await response.json()

        // Atualiza a sessão com os novos dados
        await update({
          ...session,
          user: result.user,
        })

        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso.",
        })
      })
    } catch (error) {
      console.error("[PROFILE_UPDATE]", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o perfil.",
        variant: "destructive",
      })
    }
  }

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      try {
        setIsUploading(true)
        const file = acceptedFiles[0]

        const uploadResult = await startUpload([file])
        
        if (uploadResult && uploadResult[0]) {
          const imageUrl = uploadResult[0].url
          
          const response = await fetch("/api/user/profile", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: imageUrl }),
          })

          if (!response.ok) {
            throw new Error("Falha ao atualizar imagem")
          }

          const result = await response.json()

          // Atualiza a sessão com os novos dados
          await update({
            ...session,
            user: result.user,
          })

          toast({
            title: "Foto atualizada",
            description: "Sua foto de perfil foi atualizada com sucesso.",
          })
        }
      } catch (error) {
        console.error("Erro ao fazer upload:", error)
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao atualizar sua foto.",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
  })

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "DELETE",
      })

      if (!response?.ok) {
        throw new Error("Erro ao deletar conta")
      }

      toast({
        title: "Conta deletada",
        description: "Sua conta foi deletada com sucesso.",
      })

      signOut({
        callbackUrl: "/",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao deletar sua conta.",
        variant: "destructive",
      })
    }
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais
          </p>
        </CardHeader>
        <CardContent>
          <div {...getRootProps()} className="mb-6">
            <input {...getInputProps()} />
            <div className="flex items-center space-x-4">
              <div className="relative h-20 w-20 cursor-pointer rounded-full border-2 border-dashed border-gray-300 p-1">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="Avatar"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100">
                    <Icons.user className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
                    <Icons.spinner className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium">Foto de perfil</h3>
                <p className="text-sm text-muted-foreground">
                  Clique para fazer upload de uma nova foto
                </p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Este é o seu nome de exibição.
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
                  value={session?.user?.email || ""}
                  className="w-[400px]"
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
                  Atualizar perfil
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
        </CardContent>
      </Card>
    </div>
  )
}
