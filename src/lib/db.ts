import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      },
    },
  }).$extends({
    query: {
      $allOperations({ operation, model, args, query }) {
        const start = performance.now()
        return query(args).finally(() => {
          const end = performance.now()
          console.log(`${model}.${operation} took ${end - start}ms`)
        })
      },
    },
  })
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export const db = prisma

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma
