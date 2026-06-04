"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import LoginForm from "@/app/components/LoginForm";

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
  id: string;
  email: string;
  role: string;
};

export default function StudyBoard() {
  const router = useRouter();
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [content, setContent] = useState("");
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentsByPostId, setCommentsByPostId] = useState<
    Record<number, PostComment[]>
  >({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>(
    {},
  );
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [replies, setReplies] = useState<Record<string, any[]>>({});
  const [qTitle, setQTitle] = useState("");
  const [qContent, setQContent] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [expandedPostIds, setExpandedPostIds] = useState<Set<string>>(
    new Set(),
  );

  const togglePostExpand = (postId: string) => {
    setExpandedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  // ─── 関数定義（useEffectより全部上） ───────────────────────

  const fetchLogs = async () => {
    const { data, error } = await supabase.from("posts").select("*");
    if (error) {
      console.error(error);
      return;
    }
    setLogs(data || []);
  };

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

  const fetchLikeCounts = async () => {
    const { data } = await supabase.from("likes").select("post_id");
    if (!data) return;

    const counts: Record<string, number> = {};
    data.forEach((like) => {
      counts[like.post_id] = (counts[like.post_id] || 0) + 1;
    });
    setLikeCounts(counts);
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

  const loadReplies = async (targetLogs: StudyLog[]) => {
    const newReplies: Record<string, any[]> = {};
    for (const log of targetLogs) {
      const data = await fetchReplies(log.id);
      newReplies[log.id] = data || [];
    }
    setReplies(newReplies);
    const repliesMap: Record<string, any[]> = {};

    for (const q of questions) {
      const data = await fetchReplies(q.id);
      repliesMap[q.id] = data || [];
    }

    setReplies(repliesMap);
  };
  const loadReplieLists = async () => {
    const repliesMap: Record<string, any[]> = {};

    for (const q of questions) {
      const data = await fetchReplies(q.id);
      repliesMap[q.id] = data || [];
    }

    setReplies(repliesMap);
  };

  const getUser = async () => {
    // auth は「誰がログインしているか（id）」の確認だけに使う
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      console.log("user: 未ログイン");
      setUser(null);
      return;
    }

    console.log("auth user (id のみ参照):", { id: authUser.id });

    // アプリで使うユーザー情報は public.users から取得（id は auth と同じ）
    const { data: profile, error } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("id", authUser.id)
      .single();

    if (error || !profile) {
      console.error("public.users の取得に失敗:", error?.message);
      setUser(null);
      return;
    }

    console.log("public.users:", profile);

    const appUser = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
    };
    console.log("user (state にセット):", appUser);
    setUser(appUser);
  };

  const toggleLike = async (postId: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    if (likedPosts.includes(postId)) {
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
      setLikedPosts((prev) => prev.filter((id) => id !== postId));
    } else {
      await supabase.from("likes").insert({ post_id: postId, user_id: userId });
      setLikedPosts((prev) => [...prev, postId]);
    }
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
      prev.map((l) => (l.id === editingPostId ? { ...l, content: next } : l)),
    );
    cancelEdit();
  };

  const deletePost = async (postId: string) => {
    const ok = window.confirm("この投稿を本当に削除しますか？");
    if (!ok) return;

    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      console.error(error);
      alert("削除失敗");
      return;
    }

    setLogs((prev) => prev.filter((l) => l.id !== postId));
  };

  const addLog = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("ログインしてください");
      return;
    }

    const { error } = await supabase.from("posts").insert([
      {
        title: postTitle,
        content: content,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error(error);
      alert("投稿失敗");
      return;
    }
    alert("投稿成功！");
    setPostTitle("");
    setContent("");
    fetchLogs();
  };

  const addQuestion = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("questions").insert({
      title: qTitle,
      content: qContent,
      user_id: user.id,
    });

    if (error) {
      console.error(error);
      alert("質問投稿失敗");
      return;
    }
    alert("質問投稿成功！");
    setQTitle("");
    setQContent("");
    fetchQuestions();
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("ログアウト失敗:", error.message);
      return;
    }
    // ログイン画面へ移動
    router.push("/");
  };

  // ─── useEffect ───────────────────────────────────────────────

  useEffect(() => {
    getUser();
    fetchLogs();
    fetchQuestions();
    fetchLikes();
    fetchLikeCounts();
  }, []);

  useEffect(() => {
    if (logs.length > 0) {
      loadReplies(logs);
    }
  }, [logs]);

  // ─── JSX ─────────────────────────────────────────────────────

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* 投稿フォーム（ADMIN のみ） */}
      {isAdmin && (
        <div className="bg-white shadow rounded-lg p-4 mb-4 mt-4">
          <input
            placeholder="タイトルを入力..."
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            className="w-full outline-none border-b mb-2 pb-1"
          />
          <textarea
            placeholder="学習内容を入力..."
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
      )}

      {/* ログ一覧 */}
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className=" bg-yellow-100 p-4 rounded-lg shadow">
            {replies[log.id]?.map((r) => (
              <p key={r.id} className="text-red-500 text-4xl">
                {r.content}
              </p>
            ))}
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
                <p
                  className={`whitespace-pre-wrap ${
                    expandedPostIds.has(log.id)
                      ? ""
                      : "line-clamp-3 overflow-hidden"
                  }`}
                >
                  {log.content}
                </p>
                <button
                  type="button"
                  onClick={() => togglePostExpand(log.id)}
                  className="mt-1 text-sm text-blue-600 hover:underline"
                >
                  {expandedPostIds.has(log.id) ? "閉じる" : "続きを見る"}
                </button>
                {isAdmin && (
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
                )}
              </>
            )}
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => toggleLike(log.id)}
                className={`rounded px-3 py-1 text-sm text-white ${likedPosts.includes(log.id) ? "bg-pink-700" : "bg-pink-500"}`}
              >
                いいね❤️ {likeCounts[log.id] || 0}
              </button>
            </div>
          </div>
        ))}
      </div>

     

      {/* 右上固定のログアウトボタン */}
      <button
        type="button"
        onClick={handleLogout}
        className="fixed top-6 right-6 z-40 rounded-lg bg-red-600 px-4 py-2 font-bold text-white shadow-lg transition hover:bg-red-700"
      >
        ログアウト
      </button>

      {/* 右下固定の質問ボタン */}
      <Link
        href="/questions"
        className="fixed bottom-6 right-6 z-40 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 font-bold text-white shadow-lg transition hover:bg-blue-700"
      >
        質問する
      </Link>
    </div>
  );
}
