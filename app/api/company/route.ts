import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('company_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('company_profiles')
    .insert({
      company_name: body.company_name,
      market: body.market,
      geo_notes: body.geo_notes,
      products: body.products,
      unique_features: body.unique_features,
      compliance: body.compliance,
      proof_points: body.proof_points,
      public_links: body.public_links,
      disclaimer: body.disclaimer,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
