import { supabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_openai_key",
});

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://dummy-project.supabase.co";

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "dummy_supabase_key";

const supabase = supabaseServer;

export async function POST(req: Request) {
  try {
    const { text, personaId } = await req.json();

    if (!text || !personaId) {
      return NextResponse.json(
        { error: "Missing text or personaId" },
        { status: 400 }
      );
    }

    const { data: persona, error: personaError } = await supabase
      .from("behavior_personas")
      .select("*")
      .eq("id", personaId)
      .single();

    if (personaError || !persona) {
      return NextResponse.json(
        { error: "Persona not found", detail: personaError?.message },
        { status: 404 }
      );
    }

    const systemPrompt = `
You are a ${persona.name} customer.
Description: ${persona.description}
Behavior: ${persona.behavior}
Objections: ${
      Array.isArray(persona.objection_examples)
        ? persona.objection_examples.join(", ")
        : persona.objection_examples
    }
Keep answers short and natural.
`;

    const reply = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
    });

    const replyText = reply.choices[0].message.content || "I’m not sure.";

    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: replyText,
    });

    const arrayBuffer = await speech.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    return NextResponse.json({ audio: base64Audio, replyText });
  } catch (e: any) {
    console.error("Voice reply error:", e);
    return NextResponse.json(
      { error: "voice_reply_failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
