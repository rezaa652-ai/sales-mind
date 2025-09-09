export default function EnvTest() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Env Test</h1>
      <p>
        NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
      </p>
      <p>
        NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10)}...
      </p>
    </div>
  )
}
