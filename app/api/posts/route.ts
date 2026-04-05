import { prisma } from "@/lib/prisma"
export async function GET() {
  //return Response.json({ message: "Hello API" })
  
    const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" }
    })

  return Response.json(posts)
}