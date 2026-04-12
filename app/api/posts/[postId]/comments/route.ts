import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{ postId: string }>;
};

type CreateCommentBody = {
  userId?: number;
  content?: string;

};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { postId } = await params;
    const parsedPostId = Number(postId);

    if (!Number.isInteger(parsedPostId)) {
      return NextResponse.json({ message: "postId が不正です。" }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId: parsedPostId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "コメント取得でエラーが発生しました。" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { postId } = await params;
    const parsedPostId = Number(postId);

    if (!Number.isInteger(parsedPostId)) {
      return NextResponse.json({ message: "postId が不正です。" }, { status: 400 });
    }

    const body = (await request.json()) as CreateCommentBody;
    const userId = Number(body.userId);
    const content = body.content?.trim();

    if (!Number.isInteger(userId) || !content) {
      return NextResponse.json(
        { message: "userId と content は必須です。" },
        { status: 400 },
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: parsedPostId },
      select: { id: true },
    });
    if (!post) {
      return NextResponse.json(
        { message: "対象の投稿が見つかりません。" },
        { status: 404 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json(
        { message: "対象のユーザーが見つかりません。" },
        { status: 404 },
      );
    }

    const comment = await prisma.comment.create({
      data: {
        postId: parsedPostId,
        userId,
        content,
      },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "コメント投稿でエラーが発生しました。" },
      { status: 500 },
    );
  }
}
