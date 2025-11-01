/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/audio/upload/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseFromRequest } from '@/lib/supabaseRoute'

const EMB_MODEL = process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small' // 1536 dims
const TRANSCRIBE_MODEL = process.env.OPENAI_TRANSCRIBE_MODEL || 'whisper-1'  // or 'gpt-4o-transcribe'

async function openaiTranscribe(file: File) {
  const form = new FormData()
  form.append('file', file)
  form.append('model', TRANSCRIBE_MODEL)

  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY!}` },
    body: form,
  })
  if (!r.ok) {
    const t = await r.text().catch(()=> '')
    throw new Error(`transcribe_failed: ${r.status} ${t}`)
  }
  const j = await r.json()
  return (j?.text || '').trim()
}
async function openaiEmbed(texts: string[]) {
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: EMB_MODEL, input: texts }),
  })
  const j = await r.json()
  if (!r.ok) throw new Error(`embed_failed: ${r.status} ${JSON.stringify(j).slice(0,200)}`)
  return (j?.data || []).map((d:any) => d.embedding as number[])
}

function chunkText(s: string, maxChars = 1200) {
  const out: string[] = []
  let i = 0
  while (i < s.length) {
    let end = Math.min(i + maxChars, s.length)
    const dot = s.lastIndexOf('.', end)
    if (dot > i + 200) end = Math.min(s.length, dot + 1)
    out.push(s.slice(i, end).trim())
    i = end
  }
  return out.filter(Boolean)
}
export async function POST(req: NextRequest) {
  try {
    const { supabase } = supabaseFromRequest(req)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 })

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'missing_file' }, { status: 400 })

    const id = crypto.randomUUID()
    const safeName = (file.name || 'audio').replace(/\s+/g,'_')
    const path = `${user.id}/${id}_${safeName}`

    const { error: upErr } = await supabase.storage
      .from('calls')
      .upload(path, await file.arrayBuffer(), {
        contentType: file.type || 'application/octet-stream',
        upsert: false
      })
    if (upErr) return NextResponse.json({ error: `upload_failed: ${upErr.message}` }, { status: 500 })

    const { error: callErr } = await supabase
      .from('calls')
      .insert({
        id, owner: user.id,
        filename: path,
        mime_type: file.type || null,
        size_bytes: file.size || null
      })
    if (callErr) return NextResponse.json({ error: callErr.message }, { status: 500 })
    // transcribe
    const text = await openaiTranscribe(file)
    await supabase.from('calls').update({ text }).eq('id', id)

    // chunk + embed + insert
    const chunks = chunkText(text)
    if (chunks.length) {
      const embs = await openaiEmbed(chunks)
      const rows = chunks.map((content, idx) => ({
        call_id: id, idx, content, embedding: embs[idx]
      }))
      const { error: chErr } = await supabase.from('call_chunks').insert(rows)
      if (chErr) console.error('chunk_insert_error', chErr.message)
    }

    return NextResponse.json({ ok: true, id, chunks: chunks.length })
  } catch (e:any) {
    console.error(e)
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}
