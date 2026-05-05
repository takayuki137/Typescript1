
import { supabase } from '@/lib/supabase'
import { NextResponse } from "next/server";

type RegisterRequestBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterRequestBody;
    console.log("受信body:", body); // ← 追加
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
        console.log("email:", email, "password:", password); // ← 追加

    if (!email || !password) {
      return NextResponse.json(
        { message: "メールとパスワード必須" },
        { status: 400 }
      );
    }

    // 🔥ここに書く
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    return NextResponse.json(
      { message: "登録エラー" },
      { status: 500 }
    );
  }
}