import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabaseServer";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = supabaseServer;

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }

    const prompt = `
      Generate 3 short, distinct sales personas related to: "${topic}".
      Each persona should have: name, description, behavior, and objection examples.
      Return JSON format only.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
    });

    const personas = JSON.parse(response.choices[0].message?.content || "{}");
    const { data, error } = await supabase
      .from("behavior_personas")
      .insert(personas);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    console.error("generate-behavior-personas error:", e);
    return NextResponse.json(
      { error: "generation_failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
