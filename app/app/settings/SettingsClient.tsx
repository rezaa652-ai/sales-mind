// app/app/settings/SettingsClient.tsx
'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

type Props = { initialEmail: string }

export default function SettingsClient({ initialEmail }: Props){
  const supabase = supabaseBrowser()
  const [tab, setTab] = useState<'profile'|'billing'>('profile')

  // Profile state
  const [email, setEmail] = useState(initialEmail)
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string>('')

  // Billing (placeholder for now)
  const [plan] = useState<'Free'|'Pro'>('Free')

  async function updateEmail(e: React.FormEvent){
    e.preventDefault()
    setMsg(''); setLoading(true)
    const { error } = await supabase.auth.updateUser({ email })
    setLoading(false)
    if (error) setMsg(`Kunde inte uppdatera e-post: ${error.message}`)
    else setMsg('E-post uppdaterad! Kolla din inbox om bekräftelse krävs.')
  }

  async function updatePassword(e: React.FormEvent){
    e.preventDefault()
    setMsg(''); setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: pass })
    setLoading(false)
    if (error) setMsg(`Kunde inte byta lösenord: ${error.message}`)
    else { setMsg('Lösenord uppdaterat!'); setPass('') }
  }

  function goUpgrade(){
    // Placeholder: koppla mot Stripe Checkout eller egen uppgraderingssida.
    alert('Upgrade flow not implemented yet. (Stripe/Checkout-länk här senare)')
  }

  return (
    <div className="max-w-[960px]">
      <h1 className="text-xl font-semibold mb-4">Settings</h1>

      <div className="flex gap-6">
        {/* Left menu */}
        <aside className="w-48">
          <nav className="flex flex-col gap-1">
            <button
              className={`text-left p-2 rounded ${tab==='profile'?'bg-blue-100 text-blue-700 font-medium':'hover:bg-gray-100'}`}
              onClick={()=>setTab('profile')}
            >
              Profile
            </button>
            <button
              className={`text-left p-2 rounded ${tab==='billing'?'bg-blue-100 text-blue-700 font-medium':'hover:bg-gray-100'}`}
              onClick={()=>setTab('billing')}
            >
              Billing
            </button>

            <form action="/auth/signout" method="post" className="mt-4">
              <button className="p-2 rounded bg-red-50 text-red-700 hover:bg-red-100 w-full text-left">
                Logga ut
              </button>
            </form>
          </nav>
        </aside>

        {/* Right panel */}
        <section className="flex-1">
          {msg && (
            <div className="mb-3 rounded border border-blue-200 bg-blue-50 text-blue-800 px-3 py-2 text-sm">
              {msg}
            </div>
          )}

          {tab === 'profile' && (
            <div className="space-y-6">
              <div className="border rounded p-4">
                <h2 className="font-medium mb-3">E-post</h2>
                <form onSubmit={updateEmail} className="grid gap-3 max-w-md">
                  <label className="text-sm">
                    Ny e-post
                    <input
                      className="w-full border rounded p-2"
                      type="email"
                      value={email}
                      onChange={e=>setEmail(e.target.value)}
                      required
                    />
                  </label>
                  <button
                    className="bg-[var(--brand)] text-white rounded px-4 py-2 disabled:opacity-50"
                    disabled={loading}
                  >
                    Uppdatera e-post
                  </button>
                </form>
              </div>

              <div className="border rounded p-4">
                <h2 className="font-medium mb-3">Byt lösenord</h2>
                <form onSubmit={updatePassword} className="grid gap-3 max-w-md">
                  <label className="text-sm">
                    Nytt lösenord
                    <input
                      className="w-full border rounded p-2"
                      type="password"
                      value={pass}
                      onChange={e=>setPass(e.target.value)}
                      minLength={6}
                      required
                    />
                  </label>
                  <button
                    className="bg-[var(--brand)] text-white rounded px-4 py-2 disabled:opacity-50"
                    disabled={loading}
                  >
                    Uppdatera lösenord
                  </button>
                </form>
              </div>
            </div>
          )}

          {tab === 'billing' && (
            <div className="space-y-6">
              <div className="border rounded p-4">
                <h2 className="font-medium mb-2">Prenumeration</h2>
                <p className="text-sm text-slate-600 mb-3">
                  Nuvarande plan: <b>{plan}</b>
                </p>
                <div className="flex gap-2">
                  <button
                    className="bg-[var(--brand)] text-white rounded px-4 py-2"
                    onClick={goUpgrade}
                  >
                    Upgrade
                  </button>
                  <button
                    className="border rounded px-4 py-2"
                    onClick={()=>alert('Billing portal not implemented yet')}
                  >
                    Billing portal
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  (Här kopplar vi mot Stripe Checkout/Customer Portal i nästa steg.)
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
