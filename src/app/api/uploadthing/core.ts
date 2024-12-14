import { getServerSession } from "next-auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { authOptions } from "@/lib/auth";
import { CustomSession } from "@/types";

const f = createUploadthing();

const handleAuth = async () => {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session;
};

export const ourFileRouter = {
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 }
  })
    .middleware(async () => {
      const session = await handleAuth() as CustomSession;
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
