'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function updateProfile(data: { name: string }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
      }
    })

    // Força a revalidação de todas as rotas que mostram dados do usuário
    revalidatePath('/', 'layout') // Revalida todo o layout que inclui o header
    revalidatePath('/profile')
    revalidatePath('/admin/users')
    
    return { success: true }
  } catch (error) {
    console.error('[PROFILE_UPDATE]', error)
    return { success: false, error: 'Erro ao atualizar perfil' }
  }
}
