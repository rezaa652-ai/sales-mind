// app/api/calls/transcribe/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { chunkText } from '@/lib/chunk'
import { embedText } from '@/lib/embedding'

function makeClient(req: NextRequest, res: NextResponse){
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll(){ return req.cookies.getAll() },
        setAll(c){ c.forEach(({name,value,options})=>res.cookies.set(name,value,options as CookieOptions)) }
      }
    }
  )
}

async function transcribeWithWhisper(buf: ArrayBuffer, mime: string){
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY missing')
  const fd = new FormData()
  fd.append('file', new Blob([buf], { type: mime || 'application/octet-stream' }), 'audio')
  fd.append('model', 'whisper-1')
  // Optional: language hint — uncomment if all calls are Swedish
  // fd.append('language', 'sv')

  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: fd
  })
  const j = await r.json().catch(()=> ({}))
  if (!r.ok) throw new Error(j?.error?.message || 'whisper_failed')
  const text: string = j.text || ''
  return text
}

export async function POST(req: NextRequest){
  const res = NextResponse.json({ ok: true })
  try{
    const supabase = makeClient(req, res)
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error:'unauthorized' }, { status:401 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error:'missing_id' }, { status:400 })

    // Load call row (owner scoped)
    const { data: call, error: e1 } = await supabase
      .from('calls').select('*').eq('id', id).eq('owner', user.id).single()
    if (e1 || !call) return NextResponse.json({ error:'not_found' }, { status:404 })

    // Get a signed URL to download the audio
    const key = call.filename as string
    const signed = await supabase.storage.from('calls').createSignedUrl(key, 60)
    if (signed.error || !signed.data?.signedUrl) {
      return NextResponse.json({ error: signed.error?.message || 'signed_url_failed' }, { status: 500 })
    }

    // Download audio file into memory
    const audioResp = await fetch(signed.data.signedUrl, { cache: 'no-store' })
    if (!audioResp.ok) {
      return NextResponse.json({ error: `download_failed (${audioResp.status})` }, { status: 502 })
    }
    const mime = audioResp.headers.get('content-type') || call.mime_type || 'application/octet-stream'
    const buf = await audioResp.arrayBuffer()

    // Transcribe with Whisper
    const text = await transcribeWithWhisper(buf, mime)

    // Save transcript on call
    await supabase.from('calls').update({ text }).eq('id', id).eq('owner', user.id)

    // Chunk + embed into call_chunks
    const chunks = chunkText(text, 1200)
    // Remove old chunks (re-run safe)
    await supabase.from('call_chunks').delete().eq('call_id', id)

    let idx = 0
    for (const c of chunks) {
      const emb = await embedText(c)
      const { error: insErr } = await supabase
        .from('call_chunks')
        .insert({ call_id: id, idx: idx++, content: c, embedding: emb as any })
      if (insErr) throw insErr
    }

    return NextResponse.json({ ok:true, id, chunks: chunks.length, chars: text.length })
  }catch(e:any){
    return NextResponse.json({ error: e?.message || 'transcribe_failed' }, { status: 500 })
  }
}
