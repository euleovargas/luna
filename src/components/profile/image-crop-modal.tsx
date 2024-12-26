"use client"

import { useCallback, useState, useRef } from "react"
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { useDropzone } from 'react-dropzone'
import { cn } from "@/lib/utils"

interface ImageCropModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (croppedImage: Blob) => Promise<void>
  isLoading?: boolean
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

export function ImageCropModal({ isOpen, onClose, onSave, isLoading }: ImageCropModalProps) {
  const [imgSrc, setImgSrc] = useState("")
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5242880, // 5MB
    onDrop: (acceptedFiles) => {
      handleFileSelect({ target: { files: acceptedFiles } } as any)
    },
    disabled: isUploading
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true)
      const reader = new FileReader()
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || "")
      )
      reader.readAsDataURL(e.target.files[0])
      setIsUploading(false)
    }
  }

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, 1))
  }, [])

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true)
      if (!imgRef.current || !completedCrop) return

      const image = imgRef.current
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Calculate pixel ratio
      const pixelRatio = window.devicePixelRatio
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      // Set canvas size to match the desired crop size
      canvas.width = completedCrop.width * pixelRatio * scaleX
      canvas.height = completedCrop.height * pixelRatio * scaleY

      // Set canvas scaling
      ctx.scale(pixelRatio, pixelRatio)
      ctx.imageSmoothingQuality = "high"

      // Calculate scaled crop coordinates
      const cropX = completedCrop.x * scaleX
      const cropY = completedCrop.y * scaleY
      const cropWidth = completedCrop.width * scaleX
      const cropHeight = completedCrop.height * scaleY

      // Draw the cropped image
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      )

      // Convert to blob
      canvas.toBlob(
        async (blob) => {
          if (!blob) return
          await onSave(blob)
          onClose()
        },
        "image/jpeg",
        1 // max quality
      )
    } catch (error) {
      console.error("[IMAGE_CROP]", error)
    } finally {
      setIsSaving(false)
    }
  }, [completedCrop, onSave, onClose])

  const handleClose = () => {
    if (!isLoading) {
      setImgSrc("")
      setCompletedCrop(undefined)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar foto de perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {imgSrc ? (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
              disabled={isUploading}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                style={{ transform: `scale(${1}) rotate(${0}deg)` }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          ) : (
            <div
              {...getRootProps()}
              className={cn(
                "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer",
                isDragActive ? "border-primary bg-primary/10" : "border-gray-300",
                isUploading && "cursor-not-allowed opacity-50"
              )}
            >
              <input {...getInputProps()} />
              <Icons.upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500 text-center">
                {isDragActive 
                  ? "Solte a imagem aqui..."
                  : "Arraste uma imagem ou clique para selecionar"
                }
              </p>
            </div>
          )}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setImgSrc("")
                setCompletedCrop(undefined)
              }}
            >
              Escolher outra
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!completedCrop || isLoading}
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Icons.check className="mr-2 h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
