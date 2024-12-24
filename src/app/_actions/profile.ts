"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function updateProfile({ name }: { name: string }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        name,
      },
    })

    revalidatePath("/profile")
    revalidatePath("/")
  } catch (error) {
    console.error("[PROFILE_UPDATE]", error)
    throw error
  }
}

export async function updateProfileImage({ image }: { image: string }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        image,
      },
    })

    // Revalidar todas as rotas que mostram a imagem do usuário
    revalidatePath("/profile")
    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/dashboard")
    
    // Forçar revalidação da sessão
    revalidatePath("/api/auth/session")
  } catch (error) {
    console.error("[PROFILE_IMAGE_UPDATE]", error)
    throw error
  }
}

export async function deleteProfile() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    await db.user.delete({
      where: {
        id: user.id,
      },
    })

    revalidatePath("/profile")
    revalidatePath("/")
  } catch (error) {
    console.error("[PROFILE_DELETE]", error)
    throw error
  }
}
