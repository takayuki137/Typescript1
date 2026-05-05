
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const email = cookieStore.get("email")?.value

  if (!email) {
    return new Response("未ログイン", { status: 401 })
  }

  /*const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true }
  })*/

}