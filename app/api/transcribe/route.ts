import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    console.log("🎧 Starting transcription...");

    // Find latest uploaded file without transcript
    const { data: calls, error } = await supabase
      .from("calls")
      .select("id, file_path, transcript")
      .is("transcript", null)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw error;
    if (!calls?.length) throw new Error("No new calls to transcribe");

    const call = calls[0];
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/calls/${call.file_path}`;

    console.log("🔹 Transcribing:", publicUrl);

    // Fetch audio file from Supabase public storage
    const response = await fetch(publicUrl);
    if (!response.ok) throw new Error("Failed to fetch audio file from storage");
    const audioBuffer = await response.arrayBuffer();

    // Send to OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], "audio.mp3", { type: "audio/mpeg" }),
      model: "gpt-4o-mini-transcribe",
    });

    const text = transcription.text || "";
    console.log("✅ Transcribed snippet:", text.slice(0, 50));

    // Save transcript
    await supabase.from("calls").update({ transcript: text }).eq("id", call.id);

    return NextResponse.json({
      success: true,
      id: call.id,
      snippet: text.slice(0, 80),
    });
  } catch (err: any) {
    console.error("❌ Transcription error:", err.message || err);
    return NextResponse.json(
      { success: false, error: err.message || "Transcription failed" },
      { status: 500 }
    );
  }
}
