"use client";

import { useState } from "react";

export default function LikeButton() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [animate, setAnimate] = useState(false);

  const handleClick = () => {
    setLiked((prev) => !prev);
    setCount((prev) => (liked ? prev - 1 : prev + 1));

    // アニメーション発火
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