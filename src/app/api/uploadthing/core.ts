import { createUploadthing, type FileRouter } from "uploadthing/next"
import { getCurrentUser } from "@/lib/session"

const f = createUploadthing()

const handleAuth = async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const user = await handleAuth()
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId)
      console.log("File URL:", file.url)
      
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
