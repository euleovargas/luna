'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(userId: string, data: any) {
  try {
    await db.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        image: data.image,
      }
    })

    // Revalida todas as rotas que dependem dos dados do usuário
    revalidatePath('/profile')
    revalidatePath('/admin/users')
    
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update profile' }
  }
}

export async function deleteUser(userId: string) {
  try {
    await db.user.delete({
      where: { id: userId }
    })

    // Revalida a página de usuários
    revalidatePath('/admin/users')
    
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete user' }
  }
}
