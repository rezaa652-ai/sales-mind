import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST() {
  try {
    const { data: calls } = await supabase
      .from("calls")
      .select("id, transcript")
      .not("transcript", "is", null)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!calls || calls.length === 0)
      throw new Error("No transcripts found");

    const combined = calls.map(c => c.transcript).join("\n---\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a behavioral analyst. 
Return *valid JSON only*. 
Classify personas into "customer" or "salesperson" depending on tone, content, and perspective.
If similar personas already exist, just refine their fields with updated insights.`,
        },
        {
          role: "user",
          content: `Analyze these recent sales call transcripts and generate or update behavioral personas.

Each persona must include:
{
  "type": "customer" | "salesperson",
  "name": "...",
  "description": "...",
  "behavior": "...",
  "tone": "...",
  "motivation": "...",
  "communication_style": "...",
  "pain_points": ["...", "..."],
  "buying_triggers": ["...", "..."],
  "objection_examples": ["...", "..."]
}

Return as: {"personas":[...]}.

If you detect the same persona with updated traits, output the improved version instead of a new duplicate.

Transcripts:
${combined}`,
        },
      ],
    });

    const raw = completion.choices[0].message?.content?.trim() || "";
    console.log("🧠 AI RAW OUTPUT:", raw.slice(0, 200));

    let personas: any[] = [];
    try {
      const parsed = JSON.parse(raw);
      personas = parsed.personas || parsed || [];
    } catch {
      console.warn("⚠️ AI returned non-JSON, fallback persona saved.");
      personas = [{ type: "unknown", name: "Unstructured Output", description: raw }];
    }

    // ✅ Update existing or insert new
    for (const p of personas) {
      const { data: existing } = await supabase
        .from("behavior_personas")
        .select("id")
        .eq("name", p.name)
        .eq("type", p.type)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("behavior_personas")
          .update({
            description: p.description,
            behavior: p.behavior,
            tone: p.tone,
            motivation: p.motivation,
            communication_style: p.communication_style,
            pain_points: p.pain_points,
            buying_triggers: p.buying_triggers,
            objection_examples: p.objection_examples,
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("behavior_personas").insert({
          name: p.name,
          type: p.type,
          description: p.description,
          behavior: p.behavior,
          tone: p.tone,
          motivation: p.motivation,
          communication_style: p.communication_style,
          pain_points: p.pain_points,
          buying_triggers: p.buying_triggers,
          objection_examples: p.objection_examples,
        });
      }
    }

    return NextResponse.json({ success: true, personas });
  } catch (err: any) {
    console.error("PERSONA ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
