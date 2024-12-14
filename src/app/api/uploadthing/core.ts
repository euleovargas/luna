import { getServerSession } from "next-auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { authOptions } from "@/lib/auth";
import { CustomSession } from "@/types";

const f = createUploadthing();

const handleAuth = async () => {
  const session = await getServerSession(authOptions) as CustomSession;
  if (!session) throw new Error("Unauthorized");
  return session;
};

export const ourFileRouter = {
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 }
  })
    .middleware(async () => {
      const session = await handleAuth();
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      // Não retornamos nada aqui, apenas logamos as informações
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
