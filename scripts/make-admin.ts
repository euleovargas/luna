const { PrismaClient, UserRole } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const email = 'eu.leovargas@gmail.com'
  
  const user = await prisma.user.update({
    where: { email },
    data: { role: UserRole.ADMIN },
  })

  console.log(`User ${user.name} (${user.email}) is now an admin`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
