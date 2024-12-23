'use client'

import * as React from "react"
import { useState, useEffect } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
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
import { updateProfile } from "@/app/_actions/profile"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useDropzone } from "react-dropzone"
import { useUploadThing } from "@/lib/uploadthing"

const profileFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
})

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { startUpload } = useUploadThing("imageUploader")

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: session?.user?.name || "",
    },
  })

  // Atualiza o formulário quando a sessão mudar
  useEffect(() => {
    if (session?.user?.name) {
      form.setValue("name", session.user.name)
    }
  }, [session, form])

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      try {
        setIsUploading(true)
        const uploadedFiles = await startUpload(acceptedFiles)
        
        if (uploadedFiles && uploadedFiles[0]) {
          const imageUrl = uploadedFiles[0].url
          const response = await fetch("/api/user/profile", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: imageUrl,
            }),
            cache: 'no-store'
          })

          if (!response.ok) {
            throw new Error("Erro ao atualizar foto")
          }

          const data = await response.json()
          
          if (data.success) {
            // Atualiza a sessão com a nova imagem
            await update({
              ...session,
              user: {
                ...session?.user,
                image: imageUrl,
              }
            })

            toast({
              title: "Foto atualizada",
              description: "Sua foto de perfil foi atualizada com sucesso.",
            })
          } else {
            throw new Error(data.message || "Erro ao atualizar foto")
          }
        }
      } catch (error) {
        console.error("[PROFILE_UPDATE] Error updating image:", error)
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Erro ao fazer upload da imagem",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
  })

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    try {
      setIsLoading(true)
      const result = await updateProfile(values)
      
      if (result.success) {
        // Atualiza a sessão com os novos dados
        await update({
          ...session,
          user: result.user // Usa os dados retornados do servidor
        })

        // Força um refresh da página
        router.refresh()

        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso.",
        })

        // Recarrega a página após um breve delay para garantir que tudo foi atualizado
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o perfil.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true)
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
    } finally {
      setIsDeleting(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Seu Perfil</CardTitle>
          <CardDescription>
            Gerencie suas informações pessoais e foto de perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div 
              {...getRootProps()} 
              className="relative group cursor-pointer"
            >
              <input {...getInputProps()} />
              <Avatar className="h-24 w-24 ring-2 ring-offset-2 ring-offset-background transition-all duration-300 group-hover:ring-primary">
                <AvatarImage 
                  src={session.user.image || ""}
                  alt={session.user.name || "Avatar"}
                  className={isUploading ? "opacity-50" : ""}
                />
                <AvatarFallback>{session.user.name?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center">
                {isUploading ? (
                  <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Icons.camera className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
              {isDragActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                  <p className="text-sm text-white">Solte aqui</p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-4">
              <div className="grid gap-1">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  className="w-[400px]"
                  size={32}
                  {...form.register("name")}
                  disabled={isLoading}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

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
            </div>

            <div className="flex justify-between items-center">
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
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
        </CardContent>
      </Card>
    </div>
  )
}
