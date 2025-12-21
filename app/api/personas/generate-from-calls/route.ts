import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await supabaseServer();

    // Get last few call transcripts
    const { data: calls, error } = await supabase
      .from("calls")
      .select("id, text")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error || !calls?.length) {
      return NextResponse.json({ error: "No calls found" }, { status: 404 });
    }

    // Summarize each customer’s behavior
    const summaries = [];
    for (const call of calls) {
      if (!call.text) continue;

      const prompt = `
You are a sales psychology analyst. Based on this transcript, describe:
1. The customer's personality type
2. Their tone, objection style, and motivation
3. A few example objection sentences they used

Transcript:
${call.text}

Output JSON:
{
  "name": "string",
  "description": "string",
  "behavior": "string",
  "objection_examples": ["string", "string"]
}
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const text = completion.choices[0]?.message?.content || "{}";
      const persona = JSON.parse(text);

      summaries.push(persona);

      // Save to Supabase
      await supabase.from("behavior_personas").insert({
        name: persona.name,
        description: persona.description,
        behavior: persona.behavior,
        objection_examples: persona.objection_examples,
      });
    }

    return NextResponse.json({ ok: true, personas: summaries });
  } catch (e: any) {
    console.error("generate-from-calls error:", e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
