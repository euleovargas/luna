import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.$connect()
    console.log('Successfully connected to MongoDB')
    
    // Test query
    const userCount = await prisma.user.count()
    console.log(`Number of users: ${userCount}`)
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
