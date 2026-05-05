"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LikeButton({ postId }: { postId: string }) {
  

  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [animate, setAnimate] = useState(false);

  // 初期データ取得
  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      // いいね数
      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

      setCount(count || 0);

      // 自分がいいねしてるか
      if (userId) {
        const { data } = await supabase
          .from("likes")
          .select("*")
          .eq("post_id", postId)
          .eq("user_id", userId)
          .maybeSingle();

        setLiked(!!data);
      }
    };

    fetchData();
  }, [postId]);

  // クリック処理
  const handleClick = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) return;

    if (liked) {
      // いいね解除
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      setLiked(false);
      setCount((prev) => prev - 1);
    } else {
      // いいね
      await supabase.from("likes").insert({
        post_id: postId,
        user_id: userId,
      });

      setLiked(true);
      setCount((prev) => prev + 1);
    }

    // アニメーション
    setAnimate(true);
    setTimeout(() => setAnimate(false), 200);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        fontSize: "20px",
        transform: animate ? "scale(1.3)" : "scale(1)",
        transition: "transform 0.2s ease",
      }}
    >
      {liked ? "❤️" : "🤍"} {count}
    </button>
  );
}