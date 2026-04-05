import { prisma } from "@/lib/prisma"
export async function GET() {
  //return Response.json({ message: "Hello API" })
    const users = await prisma.user.findMany()

  return Response.json(users)
}