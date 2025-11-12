"use client";
import { useState } from "react";
import AnalyticsSummary from "./AnalyticsSummary";

export default function VoiceSimMVP({ personaId }: { personaId: string }) {
  const [conversation, setConversation] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);

  async function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-US";
    rec.onresult = async (e: any) => {
      const userText = e.results[0][0].transcript;
      const res = await fetch("/api/voice-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText, personaId }),
      });
      const data = await res.json();
      const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
      audio.play();
      setConversation((p) => [...p, { user: userText, ai: data.replyText }]);
    };
    rec.start();
  }

  async function endCall() {
    const res = await fetch("/api/analyze-conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation, personaId }),
    });
    const data = await res.json();
    setReport(data);
  }

  return (
    <div className="space-y-4">
      {!report ? (
        <>
          <button
            onClick={startListening}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            🎙️ Start Call
          </button>
          <button
            onClick={endCall}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            ⛔ End Call
          </button>
        </>
      ) : (
        <AnalyticsSummary report={report} />
      )}
    </div>
  );
}
