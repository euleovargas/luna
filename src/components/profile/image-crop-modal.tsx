"use client"

import { useCallback, useState } from "react"
import ReactCrop, { Crop, PixelCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"

interface ImageCropModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (croppedImage: Blob) => Promise<void>
}

export function ImageCropModal({ isOpen, onClose, onSave }: ImageCropModalProps) {
  const [imgSrc, setImgSrc] = useState("")
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [isLoading, setIsLoading] = useState(false)

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
    const crop = centerAspectCrop(width, height, 1)
    setCrop(crop)
  }, [])

  const handleSave = useCallback(async () => {
    try {
      setIsLoading(true)
      if (!completedCrop) return

      const canvas = document.createElement("canvas")
      const image = new Image()
      image.src = imgSrc

      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height
      const ctx = canvas.getContext("2d")

      const pixelRatio = window.devicePixelRatio
      canvas.width = completedCrop.width * pixelRatio
      canvas.height = completedCrop.height * pixelRatio

      if (!ctx) return

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      ctx.imageSmoothingQuality = "high"

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      )

      // Convert canvas to blob
      canvas.toBlob(
        async (blob) => {
          if (!blob) return
          await onSave(blob)
          onClose()
        },
        "image/jpeg",
        0.95
      )
    } catch (error) {
      console.error("[IMAGE_CROP]", error)
    } finally {
      setIsLoading(false)
    }
  }, [completedCrop, imgSrc, onSave, onClose])

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
                >
                  <img
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
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Salvar
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

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  const width = 90
  const height = width / aspect
  const y = (100 - height) / 2
  const x = (100 - width) / 2

  return {
    unit: "%",
    width,
    height,
    x,
    y,
  } as Crop
}
