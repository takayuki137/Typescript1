"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // ←追加

type LoginFormValues = {
  email: string;
  password: string; 
};


export default function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.email || !values.password) {
      setMessage("メールアドレスとパスワードを入力してください。");
      return;
    }
    setIsSubmitting(true);
    setMessage("");


    try {
      //  Supabaseログイン
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setMessage("ログインに失敗しました。");
        return;
      }
      await supabase.auth.getSession(); // ← 追加
      

      router.push("/study");
    } catch (error) {
      console.error(error);
      setMessage("通信エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-16 flex w-full max-w-sm flex-col gap-4 rounded-lg border p-6"
    >
      <h1 className="text-xl font-semibold">ログイン</h1>

      <label className="flex flex-col gap-1 text-sm">
        メールアドレス
        <input
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, email: event.target.value }))
          }
          className="rounded border px-3 py-2"
          placeholder="you@example.com"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        パスワード
        <input
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, password: event.target.value }))
          }
          className="rounded border px-3 py-2"
          placeholder="********"
        />
      </label>

      <button
        type="submit"
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
        disabled={!values.email || !values.password || isSubmitting}
      >
        {isSubmitting ? "送信中..." : "ログイン"}
        
      </button>

      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}
