import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteGoogleUsers() {
  try {
    // Primeiro, encontra os IDs dos usuários que têm apenas conta Google
    const usersWithOnlyGoogle = await prisma.user.findMany({
      where: {
        accounts: {
          every: {
            provider: 'google'
          }
        }
      },
      select: {
        id: true
      }
    })

    const userIds = usersWithOnlyGoogle.map(user => user.id)

    // Deleta as contas do Google desses usuários
    const deletedAccounts = await prisma.account.deleteMany({
      where: {
        userId: {
          in: userIds
        },
        provider: 'google'
      }
    })

    // Deleta apenas os usuários que tinham somente conta Google
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds
        }
      }
    })

    console.log(`Deleted ${deletedAccounts.count} Google accounts`)
    console.log(`Deleted ${deletedUsers.count} users that had only Google accounts`)
  } catch (error) {
    console.error('Error deleting Google users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Adiciona um prompt de confirmação
console.log('\x1b[31m%s\x1b[0m', 'ATENÇÃO: Este script irá deletar PERMANENTEMENTE todos os usuários que têm apenas conta Google.')
console.log('Para continuar, digite "CONFIRMAR" e pressione Enter.')

process.stdin.once('data', (data) => {
  const input = data.toString().trim()
  if (input === 'CONFIRMAR') {
    deleteGoogleUsers()
  } else {
    console.log('Operação cancelada.')
    process.exit(0)
  }
})
