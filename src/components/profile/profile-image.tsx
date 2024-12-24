"use client"

import { useState } from "react"
import imageCompression from "browser-image-compression"
import { useUploadThing } from "@/lib/uploadthing"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/ui/icons"
import { updateProfileImage } from "@/app/_actions/profile"
import { ImageCropModal } from "@/components/profile/image-crop-modal"

interface ProfileImageProps {
  imageUrl?: string | null
  name?: string | null
}

export function ProfileImage({ imageUrl, name }: ProfileImageProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const { startUpload } = useUploadThing("imageUploader")

  const handleImageSave = async (croppedImage: Blob) => {
    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Compress image
      const compressedFile = await imageCompression(
        new File([croppedImage], "profile.jpg", { type: "image/jpeg" }),
        {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
          onProgress: (p) => setUploadProgress(Math.round(p * 50)) // First 50% is compression
        }
      )

      // Upload
      const uploadResult = await startUpload([compressedFile])
      setUploadProgress(75) // 75% after upload

      if (uploadResult && uploadResult[0]) {
        const imageUrl = uploadResult[0].url
        await updateProfileImage({ image: imageUrl })
        setUploadProgress(100)

        toast({
          title: "Foto atualizada",
          description: "Sua foto de perfil foi atualizada com sucesso.",
        })
      }
    } catch (error) {
      console.error("[PROFILE_IMAGE]", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar sua foto.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
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
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/70">
            <Icons.spinner className="h-6 w-6 animate-spin text-white" />
            <span className="mt-1 text-xs text-white">{uploadProgress}%</span>
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
