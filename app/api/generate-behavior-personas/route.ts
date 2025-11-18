import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabaseServer";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_openai_key",
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const supabase = await supabaseServer();

    // Use OpenAI to generate behavioral personas
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Generate a JSON list of 3–5 sales behavior personas with attributes like name, motivation, tone, and strategy.",
        },
        { role: "user", content: text },
      ],
    });

    const personas = JSON.parse(
      response.choices[0].message?.content || "{}"
    );

    const { data, error } = await supabase
      .from("behavior_personas")
      .insert(personas);

    if (error) {
      return NextResponse.json(
        { error: "Insert failed", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    console.error("generate-behavior-personas error:", e);
    return NextResponse.json(
      { error: "generate_behavior_personas_failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
