"use server"

import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    // Atualizar o usuário
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        image,
      },
    })

    // Forçar expiração de todas as sessões do usuário
    await db.session.deleteMany({
      where: {
        userId: session.user.id,
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
