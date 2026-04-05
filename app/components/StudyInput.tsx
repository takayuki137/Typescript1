"use client";
import { useState } from "react";
import { useEffect } from "react";

type StudyLog = {
  id: number;
  content: string;
 
};

export default function StudyBoard() {
  useEffect(() => {
  const fetchLogs = async () => {
    const res = await fetch("/api/posts");
    const data = await res.json();

    setLogs(data);
  };

  fetchLogs();
}, []);

  const [memo, setMemo] = useState("");
  const [logs, setLogs] = useState<StudyLog[]>([]);

  const addLog = () => {
    if (!memo.trim()) return;

    setLogs([{id: Date.now(), content: memo }, ...logs]);
    setMemo("");
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
        {logs.map((log, i) => (
          <div
            key={i}
            className="bg-yellow-100 p-4 rounded-lg shadow"
          >
            {log.content}
          </div>
        ))}
      </div>
    </div>
  );
}