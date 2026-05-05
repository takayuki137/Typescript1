
import { cookies } from "next/headers"
export async function GET() {
   const cookieStore = await cookies()
  const email = cookieStore.get("email")?.value

  if (!email) {
    return new Response("未ログイン", { status: 401 })
  }

  

 
}