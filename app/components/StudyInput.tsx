"use client";
import { useState } from "react";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

type StudyLog = {
  id: string;
  title: string;
  content: string;

};

type PostComment = {
  id: number;
  content: string;
  authorName: string;
};

type User = {
  id: number
  email: string
  role: string
}

export default function StudyBoard() {

  useEffect(() => {
    fetchLogs();
  }, []);

  const [user, setUser] = useState<User | null>(null)
  const [postTitle, setPostTitle] = useState("");
  const [content, setContent] = useState("");
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<number[]>([]);
  const [commentsByPostId, setCommentsByPostId] = useState<
    Record<number, PostComment[]>
  >({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const toggleLike = (postId: number) => {
    setLikedPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
    );
  };
  const fetchLogs = async () => {
    console.log("getdata");
    const { data, error } = await supabase
      .from("posts")
      .select("*")

    if (error) {
      console.error(error);
      return;
    }

    setLogs(data || []);
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

  const startEdit = (postId: string) => {
    const target = logs.find((l) => l.id === postId);
    if (!target) return;

    setEditingPostId(postId);
    setEditingContent(target.content);
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditingContent("");
  };

  const saveEdit = async () => {
    if (editingPostId == null) return;
    const next = editingContent.trim();
    if (!next) return;
    const { error } = await supabase
      .from("posts")
      .update({ content: next })
      .eq("id", editingPostId);

    if (error) {
      console.error(error);
      alert("更新失敗");
      return;
    }

    setLogs((prev) =>
      prev.map((l) =>
        l.id === editingPostId ? { ...l, content: next } : l
      )
    );
    cancelEdit();
  };

  const deletePost = async (postId: string) => {


    const ok = window.confirm("この投稿を本当に削除しますか？");
    if (!ok) return;


    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) {
      console.error(error);
      alert("削除失敗");
      return;
    }
  };

  const addLog = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("ログインしてください");
      return;
    }

    const { error } = await supabase.from("posts").insert([
      {
        title: postTitle,
        content: content,
        user_id: user.id, // ← 超重要
      }
    ]);

    if (error) {
      console.error(error);
      alert("投稿失敗");
      return;
    }

    alert("投稿成功！");
  }





  return (


    <div className="p-6 max-w-xl mx-auto">
      <div>
        <h1>投稿一覧</h1>
        {logs.map((post) => (
          <div key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
      {/* 入力カード */}
      <p>ID: {user?.id}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <input
          placeholder="タイトルを入力..."
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          className="w-full outline-none border-b mb-2 pb-1"
        />
        <textarea
          placeholder="学習内容を入力.."
          value={content}
          onChange={(e) => setContent(e.target.value)}
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
                    {user?.role == "ADMIN" && (<button
                      onClick={() => deletePost(log.id)}
                      className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                    >
                      削除
                    </button>)}
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
