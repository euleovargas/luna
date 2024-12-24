"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/session"

export async function updateProfile(data: { name: string }) {
  const currentUser = await getCurrentUser()

  if (!currentUser?.id) {
    throw new Error("Usuário não encontrado")
  }

  await db.user.update({
    where: { id: currentUser.id },
    data: {
      name: data.name,
    },
  })

  revalidatePath("/profile")
}

export async function updateProfileImage(data: { image: string }) {
  const currentUser = await getCurrentUser()

  if (!currentUser?.id) {
    throw new Error("Usuário não encontrado")
  }

  await db.user.update({
    where: { id: currentUser.id },
    data: {
      image: data.image,
    },
  })

  revalidatePath("/profile")
}

export async function deleteProfile() {
  const currentUser = await getCurrentUser()

  if (!currentUser?.id) {
    throw new Error("Usuário não encontrado")
  }

  await db.user.delete({
    where: { id: currentUser.id },
  })

  revalidatePath("/profile")
}
