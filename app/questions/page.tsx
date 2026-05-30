"use client";
import { useState } from "react";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Questions() {
  const router = useRouter();
  const [replies, setReplies] = useState<Record<string, any[]>>({});
  const [qTitle, setQTitle] = useState("");
  const [qContent, setQContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

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

  const loadQuestionReplies = async (questionList: typeof questions) => {
    const repliesMap: Record<string, any[]> = {};

    for (const q of questionList) {
      const data = await fetchReplies(q.id);
      repliesMap[q.id] = data || [];
    }

    setReplies(repliesMap);
  };

  useEffect(() => {
    if (questions.length > 0) {
      loadQuestionReplies(questions);
    }
  }, [questions]);

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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("question_replies").insert({
      question_id: questionId,
      content: content,
      user_id: user.id,
    });
  };

  

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="bg-blue-100 p-4 mt-6 rounded">


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
          投稿
        </button>
      </div>{" "}
      <h2 className="font-bold mb-2">質問一覧</h2>
      {questions.map((q) => (
        <div
          key={q.id}
          className="bg-green-100 p-3 rounded mb-2 cursor-pointer"
          onClick={() => router.push(`/questions/${q.id}`)}
        >
          <p>{q.content}</p>
          {replies[q.id]?.map((reply) => (
            <p key={reply.id}>{reply.content}</p>
          ))}
        </div>
      ))}
    </div>
  );
}
