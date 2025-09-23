'use client'
import { useEffect, useState, FormEvent } from 'react'
import { t, type Lang, getLang, setLangCookie } from '@/lib/i18n'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

type Tab = 'profile' | 'billing' | 'language'

export default function SettingsPage(){
  const [lang, setLang] = useState<Lang>('sv')
  const [tab, setTab] = useState<Tab>('profile')

  const [email, setEmail] = useState('')
  const [emailStatus, setEmailStatus] = useState<'idle'|'saving'|'done'|'err'>('idle')

  const [password, setPassword] = useState('')
  const [passStatus, setPassStatus] = useState<'idle'|'saving'|'done'|'err'>('idle')

  const [selectedLang, setSelectedLang] = useState<Lang>('sv')

  useEffect(()=>{
    const l = getLang()
    setLang(l)
    setSelectedLang(l)
    ;(async ()=>{
      try {
        const s = supabaseBrowser()
        const { data: { user } } = await s.auth.getUser()
        if (user?.email) setEmail(user.email)
      } catch {}
    })()
  },[])

  async function onEmailSubmit(e: FormEvent){
    e.preventDefault()
    if(!email?.trim()) return
    try {
      setEmailStatus('saving')
      const s = supabaseBrowser()
      const { error } = await s.auth.updateUser({ email })
      if (error) throw error
      setEmailStatus('done')
      setTimeout(()=>setEmailStatus('idle'), 1200)
    } catch {
      setEmailStatus('err')
      setTimeout(()=>setEmailStatus('idle'), 1600)
    }
  }

  async function onPasswordSubmit(e: FormEvent){
    e.preventDefault()
    if(!password || password.length < 6) return
    try {
      setPassStatus('saving')
      const s = supabaseBrowser()
      const { error } = await s.auth.updateUser({ password })
      if (error) throw error
      setPassword('')
      setPassStatus('done')
      setTimeout(()=>setPassStatus('idle'), 1200)
    } catch {
      setPassStatus('err')
      setTimeout(()=>setPassStatus('idle'), 1600)
    }
  }

  function onLangSave(){
    setLangCookie(selectedLang)
    setLang(selectedLang)
    // ensure the whole app picks it up
    if (typeof window !== 'undefined') window.location.reload()
  }

  const menu = [
    { id:'profile',   label: t(lang,'settings.menu.profile') as string,   key:'profile'   as Tab },
    { id:'billing',   label: t(lang,'settings.menu.billing') as string,   key:'billing'   as Tab },
    { id:'language',  label: t(lang,'settings.menu.language') as string,  key:'language'  as Tab },
  ]

  return (
    <div className="flex gap-8">
      {/* Vertical sub-menu */}
      <aside className="w-56">
        <nav className="flex flex-col gap-1">
          {menu.map(m => (
            <button
              key={m.id}
              onClick={()=>setTab(m.key)}
              className={`text-left px-3 py-2 rounded hover:bg-gray-100 ${
                tab===m.key ? 'bg-blue-100 text-blue-700 font-medium' : ''
              }`}
            >
              {m.label}
            </button>
          ))}

          {/* subtle divider before logout */}
          <div className="my-4 border-t border-gray-200" />

          <form action="/auth/signout" method="post">
            <button className="w-full text-left px-3 py-2 rounded bg-red-50 text-red-700 hover:bg-red-100">
              {t(lang,'settings.logout')}
            </button>
          </form>
        </nav>
      </aside>

      {/* Panel content */}
      <section className="flex-1 max-w-[720px]">
        {tab==='profile' && (
          <div className="space-y-6">
            <h1 className="text-xl font-semibold">{t(lang,'settings.profile.title')}</h1>

            <form onSubmit={onEmailSubmit} className="grid gap-2">
              <label className="text-sm">{t(lang,'settings.profile.email')}
                <input
                  className="mt-1 w-full border rounded p-2"
                  type="email"
                  value={email}
                  placeholder={t(lang,'settings.profile.newEmailPH')}
                  onChange={e=>setEmail(e.target.value)}
                />
              </label>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded bg-[var(--brand)] text-white">
                  {t(lang,'settings.profile.updateEmail')}
                </button>
                {emailStatus==='saving' && <span className="text-sm text-gray-500">{t(lang,'settings.profile.status.saving')}</span>}
                {emailStatus==='done'   && <span className="text-sm text-green-600">{t(lang,'settings.profile.status.done')}</span>}
                {emailStatus==='err'    && <span className="text-sm text-red-600">{t(lang,'settings.profile.status.err')}</span>}
              </div>
            </form>

            <form onSubmit={onPasswordSubmit} className="grid gap-2">
              <label className="text-sm">{t(lang,'settings.profile.password')}
                <input
                  className="mt-1 w-full border rounded p-2"
                  type="password"
                  value={password}
                  placeholder={t(lang,'settings.profile.newPassPH')}
                  onChange={e=>setPassword(e.target.value)}
                />
              </label>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded bg-[var(--brand)] text-white">
                  {t(lang,'settings.profile.updatePassword')}
                </button>
                {passStatus==='saving' && <span className="text-sm text-gray-500">{t(lang,'settings.profile.status.saving')}</span>}
                {passStatus==='done'   && <span className="text-sm text-green-600">{t(lang,'settings.profile.status.done')}</span>}
                {passStatus==='err'    && <span className="text-sm text-red-600">{t(lang,'settings.profile.status.err')}</span>}
              </div>
            </form>
          </div>
        )}

        {tab==='billing' && (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold">{t(lang,'settings.billing.title')}</h1>
            <p><b>{t(lang,'settings.billing.currentPlan')}:</b> {t(lang,'settings.billing.free')}</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded bg-[var(--brand)] text-white">
                {t(lang,'settings.billing.upgrade')}
              </button>
              <button className="px-4 py-2 rounded border">
                {t(lang,'settings.billing.manage')}
              </button>
            </div>
          </div>
        )}

        {tab==='language' && (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold">{t(lang,'settings.language.title')}</h1>
            <p className="text-sm text-gray-600">{t(lang,'settings.language.choose')}</p>
            <div className="flex gap-4 mt-2">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="lang" value="sv"
                  checked={selectedLang==='sv'} onChange={()=>setSelectedLang('sv')} />
                {t(lang,'settings.language.sv')}
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="lang" value="en"
                  checked={selectedLang==='en'} onChange={()=>setSelectedLang('en')} />
                {t(lang,'settings.language.en')}
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={onLangSave} className="px-4 py-2 rounded bg-[var(--brand)] text-white">
                {t(lang,'settings.language.save')}
              </button>
              <button onClick={()=>setSelectedLang(lang)} className="px-4 py-2 rounded border">
                {t(lang,'settings.language.cancel')}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
