"use client";

import { useState } from "react";

export default function PostForm() {
  const [text, setText] = useState("");

  return (
    <input
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="投稿内容"
    />
  );
}