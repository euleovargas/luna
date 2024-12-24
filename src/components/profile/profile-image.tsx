"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import imageCompression from "browser-image-compression"
import { useUploadThing } from "@/lib/uploadthing"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/ui/icons"
import { updateProfileImage } from "@/app/_actions/profile"
import { ImageCropModal } from "@/components/profile/image-crop-modal"
import { useRouter } from "next/navigation"

interface ProfileImageProps {
  imageUrl?: string | null
  name?: string | null
}

export function ProfileImage({ imageUrl, name }: ProfileImageProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const { startUpload } = useUploadThing("imageUploader")
  const router = useRouter()
  const { update: updateSession } = useSession()

  const handleImageSave = async (croppedImage: Blob) => {
    try {
      console.log("[PROFILE_IMAGE] Starting upload process")
      setIsUploading(true)

      // Compress image
      console.log("[PROFILE_IMAGE] Compressing image")
      const compressedFile = await imageCompression(
        new File([croppedImage], "profile.jpg", { type: "image/jpeg" }),
        {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        }
      )

      // Upload
      console.log("[PROFILE_IMAGE] Starting uploadthing upload")
      const uploadResult = await startUpload([compressedFile])
      console.log("[PROFILE_IMAGE] Upload result:", uploadResult)

      if (uploadResult && uploadResult[0]) {
        const imageUrl = uploadResult[0].url
        console.log("[PROFILE_IMAGE] Updating profile with URL:", imageUrl)
        await updateProfileImage({ image: imageUrl })

        // Atualizar a sessão do NextAuth
        await updateSession({
          image: imageUrl
        })

        toast({
          title: "Foto atualizada",
          description: "Sua foto de perfil foi atualizada com sucesso.",
        })

        // Forçar atualização dos dados
        router.refresh()
      }
    } catch (error) {
      console.error("[PROFILE_IMAGE] Error:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar sua foto.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setIsCropModalOpen(false)
    }
  }

  return (
    <>
      <div 
        onClick={() => setIsCropModalOpen(true)}
        className="group relative h-20 w-20 cursor-pointer rounded-full"
      >
        {/* Imagem atual */}
        <div className="h-full w-full rounded-full border-2 border-gray-200 p-1">
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
        </div>

        {/* Overlay de hover */}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Icons.edit className="h-6 w-6 text-white" />
        </div>

        {/* Overlay de loading */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/70">
            <Icons.spinner className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onSave={handleImageSave}
      />
    </>
  )
}
