import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_openai_key",
});

export async function POST(req: NextRequest) {
  try {
    const { personaId, userText } = await req.json();
    if (!personaId || !userText) {
      return NextResponse.json(
        { error: "Missing personaId or userText" },
        { status: 400 }
      );
    }

    const supabase = await supabaseServer();

    // ✅ Fetch the persona info
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

    // Generate the voice/text reply
    const prompt = `You are acting as ${persona.name || "a sales coach"} with tone "${persona.tone || "neutral"}".
Respond to this message helpfully and clearly:
"${userText}"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful conversational AI." },
        { role: "user", content: prompt },
      ],
    });

    const reply = completion.choices[0]?.message?.content || "No response generated.";

    // Optional: save to Supabase
    await supabase.from("voice_replies").insert({
      persona_id: personaId,
      user_input: userText,
      ai_reply: reply,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, reply });
  } catch (e: any) {
    console.error("voice-reply error:", e);
    return NextResponse.json(
      { error: "voice_reply_failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
