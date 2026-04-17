import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
export async function GET() {
   const cookieStore = await cookies()
  const email = cookieStore.get("email")?.value

  if (!email) {
    return new Response("未ログイン", { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    return new Response("ユーザーなし", { status: 404 })
  }

  if (user.role !== "ADMIN") {
    return new Response("権限なし", { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true
    }
  })

  return Response.json(users)
}