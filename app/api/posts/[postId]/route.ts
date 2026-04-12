import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    
    const { postId } = await params;
     
    //  届いているIDを確認
    console.log("id:", postId, typeof postId);

    await prisma.post.delete({
      where: {
        id: Number(postId),
      },
    });

    return NextResponse.json({ message: "削除成功" });
  } catch (error:any) {
    

    // 💥 ここが最重要！ターミナルにエラーの詳細を出す
    console.error("Prisma削除エラー詳細:", error.code, error.message);
    return NextResponse.json(
      { error: "削除失敗" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { postId: string } }
) {
  const { postId } = await params;
  const id = Number(postId);
  const body = await req.json();

  const updated = await prisma.post.update({
    where: { id },
    data: {
      content: body.content,
    },
  });

  return NextResponse.json(updated);
}