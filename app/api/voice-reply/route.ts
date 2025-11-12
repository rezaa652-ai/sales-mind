import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: Request) {
  const { text, personaId } = await req.json();
  const { data: persona } = await supabase
    .from("behavior_personas")
    .select("*")
    .eq("id", personaId)
    .single();

  const systemPrompt = `
You are a ${persona.name} customer.
Description: ${persona.description}
Behavior: ${persona.behavior}
Objections: ${persona.objection_examples.join(", ")}
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
}
