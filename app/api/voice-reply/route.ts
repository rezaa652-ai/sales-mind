import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const memory = new Map<string, { role: string; content: string }[]>();

export async function POST(req: NextRequest) {
  try {
    const { personaId, userText, sessionId } = await req.json();
    if (!personaId || !userText)
      return NextResponse.json({ error: "Missing personaId or userText" }, { status: 400 });

    const supabase = await supabaseServer();

    // 1️⃣ Get persona info
    const { data: persona } = await supabase
      .from("behavior_personas")
      .select("*")
      .eq("id", personaId)
      .maybeSingle();

    // 2️⃣ Get its linked call transcript
    let callContext = "";
    if (persona?.call_id) {
      const { data: call } = await supabase
        .from("calls")
        .select("text")
        .eq("id", persona.call_id)
        .maybeSingle();
      callContext = call?.text?.slice(0, 1500) || "";
    }

    const sessionKey = sessionId || personaId;
    const history = memory.get(sessionKey) || [];

    // 3️⃣ Strong contextual prompt
    const systemPrompt = `
You are simulating a *customer* in a realistic electricity sales call.
You must speak in the voice of the real customer whose call transcript is below.

Persona info:
- Name: ${persona?.name || "Unknown"}
- Behavior: ${persona?.behavior || "neutral"}
- Description: ${persona?.description || "none"}
- Typical objections: ${(persona?.objection_examples || []).join(", ")}

Transcript context (real call fragment):
"""
${callContext || "No transcript available."}
"""

Your task:
- Act *as that same person* from the transcript.
- React naturally to what the salesperson says.
- Keep replies brief (1–2 sentences) and realistic.
- Maintain continuity and emotional tone from the transcript.
- Stay in role as a *customer talking about electricity, billing, or contracts.*

Example behavior:
Salesperson: "Hi, I’m calling from Svenska Elverket regarding your electricity contract."
Customer: "Oh, yeah. I think my plan’s expiring soon — what are you offering?"

Never act as an AI or mention you are artificial.
`;

    history.push({ role: "user", content: userText });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.85,
      messages: [{ role: "system", content: systemPrompt }, ...history],
    });

    const reply = completion.choices[0]?.message?.content?.trim() || "(no reply)";
    history.push({ role: "assistant", content: reply });
    memory.set(sessionKey, history);

    // 4️⃣ Generate voice
    const tts = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: reply,
    });
    const buffer = Buffer.from(await tts.arrayBuffer());
    const base64 = buffer.toString("base64");

    return NextResponse.json({ ok: true, reply, audio: base64 });
  } catch (e: any) {
    console.error("voice-reply error:", e);
    return NextResponse.json({ error: e?.message || "voice_reply_failed" }, { status: 500 });
  }
}
