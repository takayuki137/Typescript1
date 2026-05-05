"use client";

import { FormEvent, useState } from "react";

export default function RegisterForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
            setMessage(data.message ?? "エラーが発生しました");
            return;
        }

        setMessage("登録成功！（メール確認してね）");
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto mt-16 flex w-full max-w-sm flex-col gap-4 
             rounded-xl border shadow-md p-6 bg-white"
        >
            <h1 className="text-xl font-semibold">新規登録</h1>

            {/* メール */}
            <label className="flex flex-col gap-1 text-sm font-medium">
                メールアドレス
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-md border-2 border-gray-300 px-3 py-2 
                 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20
                 transition"
                />
            </label>

            {/* パスワード */}
            <label className="flex flex-col gap-1 text-sm font-medium">
                パスワード
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-md border-2 border-gray-300 px-3 py-2 
                 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20
                 transition"
                />
            </label>

            <button className="rounded bg-black text-white py-2">
                登録
            </button>

            {message && <p className="text-sm">{message}</p>}
        </form>
    );
}