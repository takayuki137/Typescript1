"use client";
import { useState } from "react";
import { useEffect } from "react";

type StudyLog = {
  id: number;
  content: string;
};

type PostComment = {
  id: number;
  content: string;
  authorName: string;
};

export default function StudyBoard() {
  useEffect(() => {
    const fetchLogs = async () => {
      const res = await fetch("/api/posts");
      const data = (await res.json()) as StudyLog[];
      setLogs(data);
    };

    fetchLogs();
  }, []);

  const [memo, setMemo] = useState("");
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<number[]>([]);
  const [commentsByPostId, setCommentsByPostId] = useState<
    Record<number, PostComment[]>
  >({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});

  const addLog = () => {
    if (!memo.trim()) return;

    setLogs([{id: Date.now(), content: memo }, ...logs]);
    setMemo("");
  };

  const toggleLike = (postId: number) => {
    setLikedPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
    );
  };

  const submitComment = (postId: number) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    const newComment: PostComment = {
      id: Date.now(),
      content,
      authorName: "you",
    };

    setCommentsByPostId((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] ?? []), newComment],
    }));
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* 入力カード */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <textarea
          placeholder="学習内容を入力..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full resize-none outline-none"
          rows={3}
        />

        <div className="flex justify-end mt-2">
          <button
            onClick={addLog}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            保存
          </button>
        </div>
      </div>

      {/* ログ一覧 */}
      <div className="space-y-3">
        {logs.map((log) => {
          const isLiked = likedPostIds.includes(log.id);
          const comments = commentsByPostId[log.id] ?? [];
          return (
            <div
              key={log.id}
              className="bg-yellow-100 p-4 rounded-lg shadow"
            >
              {log.content}
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => toggleLike(log.id)}
                  className={`rounded px-3 py-1 text-sm text-white ${
                    isLiked ? "bg-pink-700" : "bg-pink-500"
                  }`}
                >
                  いいね
                </button>
                <span className="text-sm">{isLiked ? 1 : 0}</span>
              </div>

              <div className="mt-3 space-y-2 rounded bg-white/70 p-3">
                {comments.map((comment) => (
                  <p key={comment.id} className="text-sm">
                    <span className="font-medium">{comment.authorName}:</span>{" "}
                    {comment.content}
                  </p>
                ))}
                <div className="flex gap-2">
                  <input
                    value={commentInputs[log.id] ?? ""}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({
                        ...prev,
                        [log.id]: e.target.value,
                      }))
                    }
                    placeholder="コメントを入力..."
                    className="flex-1 rounded border bg-white px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => submitComment(log.id)}
                    className="rounded bg-blue-500 px-3 py-1 text-sm text-white"
                  >
                    送信
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}