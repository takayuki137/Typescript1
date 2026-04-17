const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  await prisma.user.create({
    data: {
      email: "admin@test.com",
      passwordHash: await bcrypt.hash("test1234", 10),
      role: "ADMIN"
    }
  })

  console.log("ユーザー作成完了")
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })