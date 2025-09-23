'use client'
import { useEffect, useState } from 'react'
import { getLang, setLangCookie, t, type Lang } from '@/lib/i18n'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

type Tab = 'profile' | 'billing' | 'language'

export default function SettingsPage(){
  const [lang,setLang] = useState<Lang>('sv')
  const [tab,setTab] = useState<Tab>('profile')
  const [email,setEmail] = useState<string>('')

  useEffect(()=>{
    setLang(getLang())
    ;(async()=>{
      const supabase = supabaseBrowser()
      const { data } = await supabase.auth.getUser()
      setEmail(data.user?.email || '')
    })()
  },[])

  function changeLang(next: Lang){
    setLangCookie(next)
    setLang(next)
  }

  async function signOut(){
    // POST so we clean cookies server-side
    await fetch('/auth/signout', { method:'POST' })
    window.location.href = '/auth'
  }

  return (
    <div className="min-h-screen">
      <h1 className="text-xl font-semibold mb-4">{t(lang,'settings.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Vertical menu */}
        <aside className="border rounded-lg p-3 bg-white">
          <nav className="flex md:flex-col gap-2">
            <button
              className={`text-left px-3 py-2 rounded ${tab==='profile' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}
              onClick={()=>setTab('profile')}
            >
              {t(lang,'settings.menu.profile')}
            </button>
            <button
              className={`text-left px-3 py-2 rounded ${tab==='billing' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}
              onClick={()=>setTab('billing')}
            >
              {t(lang,'settings.menu.billing')}
            </button>
            <button
              className={`text-left px-3 py-2 rounded ${tab==='language' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}
              onClick={()=>setTab('language')}
            >
              {t(lang,'settings.menu.language')}
            </button>

            <hr className="my-3" />

            <button
              className="text-left px-3 py-2 rounded border border-red-200 text-red-600 hover:bg-red-50"
              onClick={signOut}
            >
              {t(lang,'settings.logout')}
            </button>
          </nav>
        </aside>

        {/* Content */}
        <section className="space-y-4">
          {tab==='profile' && (
            <div className="border rounded-lg p-4 bg-white">
              <div className="grid md:grid-cols-2 gap-3">
                <label className="text-sm">{t(lang,'settings.profile.email')}
                  <input className="border rounded p-2 w-full" value={email} readOnly />
                </label>
                <label className="text-sm">{t(lang,'settings.profile.password')}
                  <input className="border rounded p-2 w-full" value="••••••••" readOnly />
                </label>
              </div>
              <div className="mt-3">
                <button className="px-4 py-2 rounded bg-[var(--brand)] text-white hover:opacity-90">
                  {t(lang,'settings.profile.change')}
                </button>
              </div>
            </div>
          )}

          {tab==='billing' && (
            <div className="border rounded-lg p-4 bg-white">
              <div className="grid md:grid-cols-2 gap-3">
                <label className="text-sm">{t(lang,'settings.billing.plan')}
                  <input className="border rounded p-2 w-full" value="Free" readOnly />
                </label>
                <div className="flex items-end">
                  <button className="px-4 py-2 rounded bg-[var(--brand)] text-white hover:opacity-90">
                    {t(lang,'settings.billing.upgrade')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab==='language' && (
            <div className="border rounded-lg p-4 bg-white">
              <div className="text-sm mb-2">{t(lang,'settings.language.choose')}</div>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-2 rounded border ${lang==='sv' ? 'bg-blue-100 border-blue-300' : 'hover:bg-slate-100'}`}
                  onClick={()=>changeLang('sv' as Lang)}
                >
                  Svenska
                </button>
                <button
                  className={`px-3 py-2 rounded border ${lang==='en' ? 'bg-blue-100 border-blue-300' : 'hover:bg-slate-100'}`}
                  onClick={()=>changeLang('en' as Lang)}
                >
                  English
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
