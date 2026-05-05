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
    const fetchLikeCounts = async () => {
      const { data } = await supabase
        .from("likes")
        .select("post_id");

      if (!data) return;

      const counts: Record<string, number> = {};

      data.forEach((like) => {
        counts[like.post_id] = (counts[like.post_id] || 0) + 1;
      });

      setLikeCounts(counts);
    };

    fetchLikeCounts();
    const fetchLikes = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) return;

      const { data } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", userId);

      setLikedPosts(data?.map((l) => l.post_id) || []);
    };

    fetchQuestions();
    fetchLikes();
    fetchLogs();
  }, []);
  const [logs, setLogs] = useState<StudyLog[]>([]);

  useEffect(() => {
    const loadReplies = async () => {
      const newReplies: Record<string, any[]> = {};

      for (const log of logs) {
        const data = await fetchReplies(log.id);
        newReplies[log.id] = data || [];
      }

      setReplies(newReplies);
    };

    if (logs.length > 0) {
      loadReplies();
    }
  }, [logs]);

  const [user, setUser] = useState<User | null>(null)
  const [postTitle, setPostTitle] = useState("");
  const [content, setContent] = useState("");

  const [likedPostIds, setLikedPostIds] = useState<number[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentsByPostId, setCommentsByPostId] = useState<
    Record<number, PostComment[]>
  >({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [replies, setReplies] = useState<Record<string, any[]>>({});
  const [qTitle, setQTitle] = useState("");
  const [qContent, setQContent] = useState("");

  const toggleLike = async (postId: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) return;

    if (likedPosts.includes(postId)) {
      // 解除
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      setLikedPosts((prev) => prev.filter((id) => id !== postId));
    } else {
      // いいね
      await supabase.from("likes").insert({
        post_id: postId,
        user_id: userId,
      });

      setLikedPosts((prev) => [...prev, postId]);
    }
  };
  const [questions, setQuestions] = useState<any[]>([]);
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

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setQuestions(data || []);
  };

  const addQuestion = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("questions").insert({
      title: qTitle,
      content: qContent,
      user_id: user.id
    });

    if (error) {
      console.error(error);
      alert("質問投稿失敗");
      return;
    }
    alert("質問投稿成功！");
    console.log("inserted");
    setQTitle("");
    setQContent("");

    fetchQuestions();
  };

  const fetchReplies = async (questionId: string) => {
    const { data, error } = await supabase
      .from("question_replies")
      .select("*")
      .eq("question_id", questionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    return data;
  };

  const submitReply = async (questionId: string, content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("question_replies").insert({
      question_id: questionId,
      content: content,
      user_id: user.id
    });
  };





  return (

    <div className="p-6 max-w-xl mx-auto">

      {/* 入力カード */}
      <p>ID: {user?.id}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <div className="bg-blue-100 p-4 mt-6 rounded">
        <h2 className="font-bold mb-2">質問する</h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="質問タイトル"
          value={qTitle}
          onChange={(e) => setQTitle(e.target.value)}
        />

        <textarea
          className="border p-2 w-full mb-2"
          placeholder="質問内容"
          value={qContent}
          onChange={(e) => setQContent(e.target.value)}
        />

        <button
          onClick={addQuestion}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          質問する
        </button>
      </div>
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
          //const comments = commentsByPostId[log.id] ?? [];


          return (
            <div
              key={log.id}
              className="bg-yellow-100 p-4 rounded-lg shadow"
            >
              {
                replies[log.id]?.map((r) => (
                  <p key={r.id}>{r.content}</p>
                ))
              }
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
                  className={`rounded px-3 py-1 text-sm text-white ${likedPosts.includes(log.id) ? "bg-pink-700" : "bg-pink-500"
                    }`}
                >
                  いいね❤️ {likeCounts[log.id] || 0}
                </button>
                <span className="text-sm">{isLiked ? 1 : 0}</span>
              </div>




            </div>




          );

        })}

      </div>

      <div className="mt-6">
        <h2 className="font-bold mb-2">質問一覧</h2>

        {questions.map((q) => (
          <div key={q.id} className="bg-green-100 p-3 rounded mb-2">
            <p className="font-bold">{q.title}</p>
            <p>{q.content}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
