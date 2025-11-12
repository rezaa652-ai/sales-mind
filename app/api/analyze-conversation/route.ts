// app/api/analyze-conversation/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { persona_id } = await req.json();

    const { data: personas } = await supabase
      .from("behavior_personas")
      .select("*")
      .eq("id", persona_id)
      .limit(1);

    const { data: calls } = await supabase
      .from("calls")
      .select("transcript")
      .not("transcript", "is", null)
      .limit(3);

    if (!calls?.length) return NextResponse.json({ success: false, error: "No transcripts available" });

    const prompt = `
Given these call transcripts and this customer persona, generate a JSON report with empathy_score (0-100) and talk_ratio (percentage rep vs. customer):
Persona: ${JSON.stringify(personas?.[0])}
Transcripts: ${calls.map(c=>c.transcript).join("\n---\n")}
Return format: {"empathy_score":85,"talk_ratio":{"rep":60,"customer":40}}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const result = JSON.parse(response.choices[0].message?.content || "{}");

    await supabase.from("conversation_analytics").insert({
      persona_id,
      report: result,
      conversation: calls,
    });

    return NextResponse.json({ success: true, report: result });
  } catch (err: any) {
    console.error("ANALYTICS ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
