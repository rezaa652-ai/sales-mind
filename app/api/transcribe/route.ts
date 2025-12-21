import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

// 🔹 ES5-safe helper at module scope
const upsertPersona = async ({
  role,
  transcript,
  callId,
  userId,
  supabase,
}: {
  role: "customer" | "salesperson";
  transcript: string;
  callId?: string;
  userId?: string;
  supabase: any;
}) => {
  const perspective =
    role === "customer"
      ? "Analyze the CUSTOMER’s behavior, mindset, tone, and decision psychology."
      : "Analyze the SALESPERSON’s communication approach, tone, strategy, and persuasion method.";

  const personaPrompt = `
You are a professional behavioral analyst for sales conversations.

${perspective}

Call Transcript:
${transcript}

Return ONLY valid JSON:
{
  "name": "string",
  "description": "3–5 sentence behavioral description",
  "communication_style": "string",
  "motivation": "string",
  "tone_keywords": ["string"],
  "decision_factors": "string",
  "objection_patterns": ["string"],
  "behavior_summary": "string",
  "objection_examples": ["string"]
}`;

  const personaRes = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: personaPrompt }],
        temperature: 0.5,
      }),
    }
  );

  const aiJson = await personaRes.json();

  let persona: any;
  try {
    persona = JSON.parse(
      aiJson?.choices?.[0]?.message?.content || "{}"
    );
  } catch {
    persona = {
      name: `Anonymous ${role}`,
      description: `Auto-generated ${role} persona`,
      communication_style: "N/A",
      motivation: "N/A",
      tone_keywords: [],
      decision_factors: "N/A",
      objection_patterns: [],
      behavior_summary: "N/A",
      objection_examples: [],
    };
  }

  // 🔁 Merge salesperson personas
  if (role === "salesperson" && persona.name) {
    const { data: existing } = await supabase
      .from("behavior_personas")
      .select("*")
      .eq("role", "salesperson")
      .ilike("name", `%${persona.name}%`)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from("behavior_personas")
        .update({
          ...persona,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing[0].id);

      console.log("🔁 Updated salesperson persona:", persona.name);
      return persona;
    }
  }

  await supabase.from("behavior_personas").insert({
    ...persona,
    call_id: callId || null,
    owner: userId || null,
    role,
    created_at: new Date().toISOString(),
  });

  console.log(`✅ New persona created (${role}): ${persona.name}`);
  return persona;
};

export async function POST(req: Request) {
  try {
    const { audioUrl, filename, userId, callId } = await req.json();
    if (!audioUrl) {
      return NextResponse.json(
        { error: "missing_audio_url" },
        { status: 400 }
      );
    }

    const audioResponse = await fetch(audioUrl, { cache: "no-store" });
    if (!audioResponse.ok) {
      throw new Error(`Audio fetch failed: ${audioResponse.status}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const file = new File([audioBuffer], filename || "audio.mp3", {
      type: "audio/mpeg",
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", "whisper-1");

    const openaiRes = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      }
    );

    const rawText = await openaiRes.text();
    const result = JSON.parse(rawText);
    const transcript = result.text || "(no text)";

    const supabase = await supabaseServer();

    await supabase.from("call_transcripts").insert({
      call_id: callId,
      filename,
      transcript,
      owner: userId || null,
    });

    const customerPersona = await upsertPersona({
      role: "customer",
      transcript,
      callId,
      userId,
      supabase,
    });

    const salespersonPersona = await upsertPersona({
      role: "salesperson",
      transcript,
      callId,
      userId,
      supabase,
    });

    return NextResponse.json({
      ok: true,
      transcript,
      personas: { customerPersona, salespersonPersona },
    });
  } catch (e: any) {
    console.error("Transcription error:", e);
    return NextResponse.json(
      { error: "transcription_failed", detail: e?.message },
      { status: 500 }
    );
  }
}
