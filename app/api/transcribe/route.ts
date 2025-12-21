import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { audioUrl, filename, userId, callId } = await req.json();
    if (!audioUrl) return NextResponse.json({ error: "missing_audio_url" }, { status: 400 });

    console.log("🎧 Fetching:", audioUrl);
    const audioResponse = await fetch(audioUrl, { cache: "no-store" });
    if (!audioResponse.ok) throw new Error(`Audio fetch failed: ${audioResponse.status}`);

    const audioBuffer = await audioResponse.arrayBuffer();
    const file = new File([audioBuffer], filename || "audio.mp3", { type: "audio/mpeg" });

    // 🧠 Send to Whisper
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", "whisper-1");

    const openaiRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: formData,
    });

    const rawText = await openaiRes.text();
    let result: any;
    try {
      result = JSON.parse(rawText);
    } catch {
      console.error("⚠️ Whisper returned invalid JSON:", rawText.slice(0, 200));
      throw new Error("Invalid JSON from Whisper");
    }

    const transcript = result.text || "(no text)";
    console.log("✅ Transcription complete, preview:", transcript.slice(0, 120));

    const supabase = await supabaseServer();

    // 📝 Save transcript
    await supabase.from("call_transcripts").insert({
      call_id: callId,
      filename,
      transcript,
      owner: userId || null,
    });

    // 🔹 Function to generate or refine persona
    async function upsertPersona(role: "customer" | "salesperson") {
      const perspective =
        role === "customer"
          ? "Analyze the CUSTOMER’s behavior, mindset, tone, and decision psychology."
          : "Analyze the SALESPERSON’s communication approach, tone, strategy, and persuasion method.";

      // Step 1️⃣ - Deep contextual analysis
      const personaPrompt = `
You are a professional behavioral analyst for sales conversations. Your task is to build a detailed ${role.toUpperCase()} persona based on this 3-minute call transcript.

Call Transcript:
${transcript}

Follow these exact steps in your reasoning before generating output:
1. Identify who is speaking as ${role}.
2. Analyze their communication tone (calm, emotional, assertive, hesitant, warm, formal, etc.).
3. Describe their mindset, motivation, and behavioral traits.
4. Detect any frustration, confidence, dominance, empathy, or confusion.
5. List recurring words or sentence structures that reveal cognitive/emotional patterns.
6. Summarize their communication rhythm (fast, slow, reactive, reflective).
7. Identify their decision or persuasion style.
8. Provide example sentences that capture their essence.

Finally, output only this valid JSON object (no markdown, no commentary):
{
  "name": "string (use the speaker's name if present, else 'Anonymous ${role}')",
  "description": "Detailed paragraph (3–5 sentences) capturing who they are and how they behave in conversation.",
  "communication_style": "string (keywords like 'empathetic', 'pushy', 'friendly', 'analytical')",
  "motivation": "string (what drives them — saving money, control, approval, clarity, etc.)",
  "tone_keywords": ["keyword1", "keyword2", "keyword3"],
  "decision_factors": "string (what influences their yes/no decisions)",
  "objection_patterns": ["string", "string", "string"],
  "behavior_summary": "Condensed one-sentence summary of their personality",
  "objection_examples": ["string", "string"]
}`;

      const personaRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: personaPrompt }],
          temperature: 0.5,
        }),
      });

      const aiJson = await personaRes.json();
      let persona: any = {};
      try {
        persona = JSON.parse(aiJson?.choices?.[0]?.message?.content || "{}");
      } catch {
        console.warn("⚠️ Persona JSON parse failed — fallback used.");
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

      // Step 2️⃣ - Refine or insert (merge salesperson data)
      if (role === "salesperson" && persona.name) {
        const { data: existing } = await supabase
          .from("behavior_personas")
          .select("*")
          .eq("role", "salesperson")
          .ilike("name", `%${persona.name}%`)
          .limit(1);

        if (existing && existing.length > 0) {
          const prev = existing[0];
          console.log(`🔁 Refining existing salesperson persona: ${prev.name}`);

          const refinePrompt = `
You are refining a salesperson's behavioral persona based on new evidence.

Old Persona:
${JSON.stringify(prev, null, 2)}

New Transcript:
${transcript}

Goal: create a more accurate, detailed, and consistent persona.
Use both datasets. Preserve the person's identity, merge contradictions, and improve precision.
Return JSON in the same schema as before.`;

          const refineRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [{ role: "user", content: refinePrompt }],
              temperature: 0.4,
            }),
          });

          const refineJson = await refineRes.json();
          let refined = {};
          try {
            refined = JSON.parse(refineJson?.choices?.[0]?.message?.content || "{}");
          } catch {
            refined = persona;
          }

          await supabase
            .from("behavior_personas")
            .update({
              ...refined,
              updated_at: new Date().toISOString(),
            })
            .eq("id", prev.id);

          return refined;
        }
      }

      // Step 3️⃣ - Insert new persona
      await supabase.from("behavior_personas").insert({
        ...persona,
        call_id: callId || null,
        owner: userId || null,
        role,
        created_at: new Date().toISOString(),
      });

      console.log(`✅ New persona created (${role}): ${persona.name}`);
      return persona;
    }

    // 🧩 Generate both personas
    const customerPersona = await upsertPersona("customer");
    const salespersonPersona = await upsertPersona("salesperson");

    return NextResponse.json({
      ok: true,
      transcript,
      personas: { customerPersona, salespersonPersona },
    });
  } catch (e: any) {
    console.error("Transcription error:", e);
    return NextResponse.json(
      { error: "transcription_failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
