import { supabaseServer } from "@/lib/supabaseServer";
/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

async function s() {
  return await supabaseServer();
}

type SaveBody = {
  companyId?: string;
  profileId?: string;
  question: string;
  outputs: {
    one_liner?: string;
    why?: string;
    ack?: string;
    short_script?: string;
    full_script?: string;
    math?: string;
    next_step?: string;
  };
  like?: boolean;
  rating?: number | null;
  tags?: string[] | null;
  eventId?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await s();
    const body: SaveBody = await req.json();

    if (!body?.question)
      return NextResponse.json({ error: 'missing_question' }, { status: 400 });

    const tables = ['kb', 'knowledge_base', 'kb_items'];
    let inserted: any = null;
    let lastError: any = null;

    for (const table of tables) {
      const payload: any = {
        company_id: body.companyId || null,
        profile_id: body.profileId || null,
        question: body.question,
        one_liner: body.outputs?.one_liner || null,
        why: body.outputs?.why || null,
        ack: body.outputs?.ack || null,
        short_script: body.outputs?.short_script || null,
        full_script: body.outputs?.full_script || null,
        math: body.outputs?.math || null,
        next_step: body.outputs?.next_step || null,
        liked: body.like ?? null,
        rating: body.rating ?? null,
        tags: body.tags ?? null,
        event_id: body.eventId ?? null,
      };

      const { data, error } = await supabase
        .from(table)
        .insert(payload)
        .select()
        .maybeSingle();

      if (!error && data) {
        inserted = data;
        break;
      }
      lastError = error;
    }

    if (!inserted) {
      return NextResponse.json(
        {
          error: 'insert_failed',
          detail: lastError?.message || 'kb insert failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, item: inserted });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'kb_save_error', detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
