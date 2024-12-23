"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useUploadThing } from "@/lib/uploadthing"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useDropzone } from "react-dropzone"
import { Icons } from "@/components/ui/icons"
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
import { CustomSession } from "@/types"
import { updateUserProfile } from "@/app/_actions/user"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const profileFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
})

export default function ProfilePage() {
  const router = useRouter()
  const { data: sessionData, update } = useSession()
  const session = sessionData as CustomSession
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { startUpload } = useUploadThing("imageUploader")

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: session?.user?.name || "",
    },
  })

  useEffect(() => {
    if (session?.user?.name) {
      form.setValue("name", session.user.name)
    }
  }, [session?.user?.name, form])

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
      const result = await updateUserProfile(session.user.id, values)
      
      if (result.success) {
        // Atualiza a sessão com os novos dados
        await update({
          ...session,
          user: {
            ...session?.user,
            name: values.name,
          }
        })

        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso.",
        })
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

  const deleteAccount = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch("/api/user/profile", {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account")
      }

      if (data.success) {
        toast({
          title: "Conta deletada",
          description: "Sua conta foi deletada com sucesso.",
        })
        // Fazer logout e redirecionar
        await signOut({
          redirect: true,
          callbackUrl: "/account-deleted"
        })
      } else {
        throw new Error(data.message || "Erro ao deletar conta")
      }
    } catch (error) {
      console.error("[PROFILE_DELETE] Error:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível deletar a conta.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
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
            <div className="grid gap-2">
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
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Atualizar perfil
            </Button>
          </form>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={session.user.email || ""}
              disabled
              placeholder="seu@email.com"
            />
          </div>

          <div className="pt-4 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Deletar conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso irá deletar permanentemente sua conta
                    e remover seus dados dos nossos servidores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={deleteAccount}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Deletando...
                      </>
                    ) : (
                      "Continuar"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
