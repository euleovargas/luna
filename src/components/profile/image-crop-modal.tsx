"use client"

import { useCallback, useState, useRef } from "react"
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"

interface ImageCropModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (croppedImage: Blob) => Promise<void>
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

export function ImageCropModal({ isOpen, onClose, onSave }: ImageCropModalProps) {
  const [imgSrc, setImgSrc] = useState("")
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [isSaving, setIsSaving] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || "")
      )
      reader.readAsDataURL(e.target.files[0])
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar foto de perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!imgSrc ? (
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <input
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                className="hidden"
                id="image-input"
              />
              <label
                htmlFor="image-input"
                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-8 hover:border-gray-400 cursor-pointer"
              >
                <Icons.upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">
                  Clique para selecionar uma imagem
                </span>
              </label>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                  keepSelection
                >
                  <img
                    ref={imgRef}
                    src={imgSrc}
                    alt="Crop me"
                    onLoad={onImageLoad}
                    className="max-h-[400px]"
                  />
                </ReactCrop>
              </div>

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
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={!completedCrop || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
