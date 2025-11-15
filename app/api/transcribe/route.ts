import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = supabaseServer;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const filename = formData.get("filename") as string;

    if (!file || !filename) {
      return NextResponse.json({ error: "Missing file or filename" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const transcription = await openai.audio.transcriptions.create({
      file: new File([buffer], filename, { type: "audio/mpeg" }),
      model: "gpt-4o-mini-transcribe",
      response_format: "text",
    });

    // Optional: store transcript in Supabase (safe call)
    await supabase
      .from("call_transcripts")
      .insert({ filename, transcript: transcription });

    return NextResponse.json({ transcript: transcription });
  } catch (e: any) {
    console.error("transcribe route error:", e);
    return NextResponse.json(
      { error: "transcription_failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
