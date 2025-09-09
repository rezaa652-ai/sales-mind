import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('ts', { ascending: false })
    .limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('events')
    .insert({
      ts: body.ts ?? new Date().toISOString(),
      company: body.company,
      profile_name: body.profile_name,
      goal: body.goal,
      segment: body.segment,
      channel: body.channel,
      numbers: body.numbers,
      question: body.question,
      kb_hit: !!body.kb_hit,
      rating: body.rating,
      used: body.used,
      tags: body.tags,
      response_id: body.response_id,
      one_liner: body.one_liner,
      why: body.why,
      ack: body.ack,
      short_script: body.short_script,
      full_script: body.full_script,
      math: body.math,
      next_step: body.next_step,
      raw_json: body.raw_json ?? null,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
