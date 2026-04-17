import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {


    const { postId } = await params;

    const cookieStore = await cookies();
    const email = cookieStore.get("email")?.value;

    if (!email) {
      return NextResponse.json({ error: "未ログイン" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "ユーザーなし" }, { status: 404 });
    }

    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });

    if (!post) {
      return NextResponse.json({ error: "投稿なし" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && post.userId !== user.id) {
      console.log("こんにちは");
      console.log("user.role:", user.role);
      return NextResponse.json({ error: "権限なし" }, { status: 403 });

    }


    //  届いているIDを確認
    //console.log("id:", postId, typeof postId);

    await prisma.post.delete({
      where: {
        id: Number(postId),
      },
    });

    return NextResponse.json({ message: "削除成功" });

  } catch (error: any) {

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
  { params }: { params: Promise<{ postId: string }> }
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