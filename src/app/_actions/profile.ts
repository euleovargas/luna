"use server"

import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"
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
  noStore()
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Atualizar o usuário
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        image,
      },
    })

    // Atualizar a sessão no banco de dados
    await db.session.updateMany({
      where: {
        userId: user.id,
      },
      data: {
        user: {
          image,
        },
      },
    })

    // Revalidar todas as rotas que mostram a imagem do usuário
    revalidatePath("/", "layout")
    revalidatePath("/profile", "layout")
    revalidatePath("/admin", "layout")
    revalidatePath("/dashboard", "layout")
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
