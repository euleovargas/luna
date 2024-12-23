'use server'

import { db } from "@/lib/db"
import { revalidatePath, revalidateTag } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function updateProfile(data: { name: string }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
      }
    })

    // Revalidação agressiva de todas as rotas e tags
    revalidateTag('user') // Revalida todos os dados de usuário
    revalidateTag('session') // Revalida dados da sessão
    revalidatePath('/', 'layout') // Revalida todo o layout
    revalidatePath('/profile') // Revalida a página de perfil
    revalidatePath('/admin/users') // Revalida a lista de usuários
    
    return { 
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      }
    }
  } catch (error) {
    console.error('[PROFILE_UPDATE]', error)
    return { success: false, error: 'Erro ao atualizar perfil' }
  }
}
