"use client";
import { useState } from "react";
import { useEffect } from "react";

type StudyLog = {
  id: number;
  title: string;
  content: string;

};

type PostComment = {
  id: number;
  content: string;
  authorName: string;
};

export default function StudyBoard() {

  const fetchLogs = async () => {
  const res = await fetch("/api/posts");
  const data = (await res.json()) as StudyLog[];
  setLogs(data);
  };

  useEffect(() => {
 
    fetchLogs();
  }, []);

  const [memo, setMemo] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<number[]>([]);
  const [commentsByPostId, setCommentsByPostId] = useState<
    Record<number, PostComment[]>
  >({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

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

  const startEdit = (postId: number) => {
    const target = logs.find((l) => l.id === postId);
    if (!target) return;

    setEditingPostId(postId);
    setEditingContent(target.content);
  }; 

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditingContent("");
  };

  const saveEdit =async () => {
    if (editingPostId == null) return;
    const next = editingContent.trim();
    if (!next) return;

    const res = await fetch(`/api/posts/${editingPostId}`, {
    method: "PATCH", // or PUT
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: next }),
    });

    const updated = await res.json();

    setLogs((prev) =>
      prev.map((l) => (l.id === editingPostId ? updated : l)),
    );
    cancelEdit();
  };


  const deletePost = async (postId: number) => {
    const ok = window.confirm("この投稿を本当に削除しますか？");
    if (!ok) return;

    const res = await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("削除失敗");
      return;
    }

    setLogs((prev) => prev.filter((l) => l.id !== postId));
    setLikedPostIds((prev) => prev.filter((id) => id !== postId));
    setCommentsByPostId((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
    setCommentInputs((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
    if (editingPostId === postId) cancelEdit();
  };

const addLog = async () => {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: postTitle,
      content: memo,
      userId: 1,
    }),
  });
  await fetchLogs();
  if (res.ok) {
  setPostTitle("");
  setMemo("");
}
  //const newLog = await res.json();

  //setLogs((prev) => [...prev, newLog]); // ←即反映
};

  

  

  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* 入力カード */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <input
          placeholder="タイトルを入力..."
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          className="w-full outline-none border-b mb-2 pb-1"
        />
        <textarea
          placeholder="学習内容を入力.."
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
              {editingPostId === log.id ? (
                <div className="flex flex-col gap-2">

                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full resize-none rounded border bg-white p-2 text-sm outline-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="rounded bg-green-600 px-3 py-1 text-sm text-white"
                    >
                      更新
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded bg-gray-500 px-3 py-1 text-sm text-white"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={() => deletePost(log.id)}
                      className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-bold text-base mb-1">{log.title}</p>
                  <p className="whitespace-pre-wrap">{log.content}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => startEdit(log.id)}
                      className="rounded bg-gray-700 px-3 py-1 text-sm text-white"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => deletePost(log.id)}
                      className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                    >
                      削除
                    </button>
                  </div>
                </>
              )}
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => toggleLike(log.id)}
                  className={`rounded px-3 py-1 text-sm text-white ${isLiked ? "bg-pink-700" : "bg-pink-500"
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