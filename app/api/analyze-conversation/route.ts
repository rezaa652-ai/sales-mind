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
    const { text, conversationId } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    // Example logic: analyze tone, clarity, and keywords with OpenAI
    const analysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI call coach. Analyze the conversation for clarity, tone, and persuasion.",
        },
        { role: "user", content: text },
      ],
    });

    const summary = analysis.choices[0].message.content || "No analysis result.";

    // Store analysis in Supabase if a conversationId is provided
    if (conversationId) {
      await supabase.from("call_analytics").insert({
        conversation_id: conversationId,
        analysis: summary,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ summary });
  } catch (e: any) {
    console.error("Analyze conversation error:", e);
    return NextResponse.json(
      { error: "analyze_conversation_failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
