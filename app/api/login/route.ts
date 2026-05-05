import { supabase } from '@/lib/supabase'
import { NextResponse } from "next/server";
import { cookies } from "next/headers"

type LoginRequestBody = {
  email?: string;
  password?: string;
};


export async function POST(request: Request) {
  try {

    const body = (await request.json()) as LoginRequestBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    console.log("受け取った値:", { email, password });

    if (!email || !password) {
      return NextResponse.json(
        { message: "メールアドレスとパスワードを入力してください。" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    console.log("supabase result:", data);
    console.log("supabase error:", error);

    if (error || !data.user) {
      return NextResponse.json(
        { message: "ログイン情報が正しくありません。" },
        { status: 401 },
      );
    }

    const cookieStore = await cookies()

    cookieStore.set("email", email)

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "ログイン処理でエラーが発生しました。" },
      { status: 500 },
    );
  }
}
