"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { useUploadThing } from "@/lib/uploadthing"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/ui/icons"
import { updateProfileImage } from "@/app/_actions/profile"

interface ProfileImageProps {
  imageUrl?: string | null
  name?: string | null
}

export function ProfileImage({ imageUrl, name }: ProfileImageProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { startUpload } = useUploadThing("imageUploader")

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      try {
        setIsUploading(true)
        const file = acceptedFiles[0]

        const uploadResult = await startUpload([file])
        
        if (uploadResult && uploadResult[0]) {
          const imageUrl = uploadResult[0].url
          
          await updateProfileImage({ image: imageUrl })

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

  return (
    <div {...getRootProps()} className="mb-6">
      <input {...getInputProps()} />
      <div className="flex items-center space-x-4">
        <div className="relative h-20 w-20 cursor-pointer rounded-full border-2 border-dashed border-gray-300 p-1">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name || "Avatar"}
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
  )
}
