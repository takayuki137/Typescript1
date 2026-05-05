import { NextResponse } from "next/server";

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



 

 




    //  届いているIDを確認
    //console.log("id:", postId, typeof postId);



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



}