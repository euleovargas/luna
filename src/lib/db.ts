import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      },
    },
  })

  // Add performance monitoring
  prisma.$use(async (params, next) => {
    const start = performance.now()
    const result = await next(params)
    const end = performance.now()
    console.log(`${params.model}.${params.action} took ${end - start}ms`)
    return result
  })

  return prisma
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

export const db = prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
