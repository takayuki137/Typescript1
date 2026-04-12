import { prisma } from "@/lib/prisma"
export async function GET() {
  //return Response.json({ message: "Hello API" })
  
    const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" }
    })

  return Response.json(posts)
}

export async function POST(req: Request) {
  const { content, userId,title } = await req.json()
  

  const post = await prisma.post.create({
    data: {
      title ,       
      content,
      userId,
    }
    
  })
  
  return Response.json(post, { status: 201 })
  
}