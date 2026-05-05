"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

export default function QuestionDetail() {
  const params = useParams();
  const id = params.id as string;

  const [question, setQuestion] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyContent, setReplyContent] = useState("");

  const fetchQuestion = async () => {
    const { data } = await supabase
      .from("questions")
      .select("*")
      .eq("id", id)
      .single();

    setQuestion(data);
  };

  const fetchReplies = async () => {
    const { data } = await supabase
      .from("question_replies")
      .select("*")
      .eq("question_id", id)
      .order("created_at", { ascending: true });

    setReplies(data || []);
  };

  useEffect(() => {
    if (!id) return; // ← これ重要
    fetchQuestion();
    fetchReplies();
  }, [id]); // ← params.idじゃなくて id

  const handleReply = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("question_replies").insert({
      question_id: id,
      content: replyContent,
      user_id: user.id,
    });

    setReplyContent("");
    fetchReplies();
  };

  return (
    <div>
      {question && (
        <>
          <h2>{question.title}</h2>
          <p>{question.content}</p>
        </>
      )}

      {replies.map((r) => (
        <p key={r.id}>{r.content}</p>
      ))}

      <textarea
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
      />

      <button onClick={handleReply}>返信する</button>
    </div>
  );
}