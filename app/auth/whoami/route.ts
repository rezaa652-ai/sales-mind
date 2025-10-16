import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
function makeClient(req: NextRequest, res: NextResponse){
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies:{ getAll(){return req.cookies.getAll()}, setAll(c){c.forEach(({name,value,options})=>{res.cookies.set(name,value,options as CookieOptions)})} } }
  );
}
export async function GET(req: NextRequest){
  const res = NextResponse.json({});
  const supabase = makeClient(req,res);
  const { data:{ user }, error } = await supabase.auth.getUser();
  return NextResponse.json({ ok:!!user && !error, error:error?.message||null, user:user?{id:user.id,email:user.email}:null, cookies:req.cookies.getAll().map(c=>c.name) });
}
