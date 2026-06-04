"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("メールとパスワードを入力してください。");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("登録成功！（メール確認してね）");
      setEmail("");
      setPassword("");
    } catch {
      setMessage("登録エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-16 flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-white p-6 shadow-md"
    >
      <h1 className="text-xl font-semibold">新規登録</h1>

      <label className="flex flex-col gap-1 text-sm font-medium">
        メールアドレス
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border-2 border-gray-300 px-3 py-2 transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        パスワード
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border-2 border-gray-300 px-3 py-2 transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-black py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "登録中..." : "登録"}
      </button>

      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}
