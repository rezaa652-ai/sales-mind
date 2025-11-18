import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabaseServer";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_openai_key",
});

export async function POST(req: Request) {
  try {
    const { audioUrl, filename } = await req.json();

    if (!audioUrl) {
      return NextResponse.json({ error: "Missing audio URL" }, { status: 400 });
    }

    const supabase = await supabaseServer();

    // Fetch audio file
    const audioResponse = await fetch(audioUrl);
    const audioBlob = await audioResponse.blob();

    // Transcribe audio with OpenAI Whisper
    const formData = new FormData();
    formData.append("file", audioBlob, filename || "audio.mp3");
    formData.append("model", "whisper-1");

    const transcriptionResponse = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      }
    );

    if (!transcriptionResponse.ok) {
      const errText = await transcriptionResponse.text();
      throw new Error(`Transcription failed: ${errText}`);
    }

    const transcriptionData = await transcriptionResponse.json();
    const transcription = transcriptionData.text || "";

    // Optional: store transcript in Supabase (safe call)
    await supabase
      .from("call_transcripts")
      .insert({ filename, transcript: transcription });

    return NextResponse.json({ transcript: transcription });
  } catch (e: any) {
    console.error("Transcription error:", e);
    return NextResponse.json(
      { error: "transcription_failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
