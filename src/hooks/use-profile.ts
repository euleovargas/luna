'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { toast } from '@/components/ui/use-toast'

interface ProfileData {
  name: string
}

export function useProfile() {
  const { update } = useSession()
  const queryClient = useQueryClient()

  const updateProfile = useMutation({
    mutationFn: async (data: ProfileData) => {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Falha ao atualizar perfil')
      }

      return response.json()
    },
    onSuccess: async (data) => {
      // Atualiza a sessão com os novos dados
      await update({
        user: data.user,
      })

      // Invalida queries que dependem dos dados do usuário
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['session'] })

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      })
    },
    onError: (error) => {
      console.error('Erro ao atualizar perfil:', error)
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar o perfil.',
        variant: 'destructive',
      })
    },
  })

  return {
    updateProfile,
  }
}
