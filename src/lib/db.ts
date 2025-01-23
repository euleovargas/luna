const { PrismaClient } = require('@prisma/client')

// eslint-disable-next-line no-var
global.prisma = global.prisma || undefined

const prismaClientSingleton = () => {
  return new PrismaClient()
}

const db = global.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = db
}

module.exports = { db }
