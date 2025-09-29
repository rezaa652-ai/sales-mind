// lib/i18n.ts
export type Lang = 'sv' | 'en'

const dict: Record<Lang, Record<string, string>> = {
  sv: {
    // App & nav
    'app.title': 'SalesMind',
    'nav.qa': 'Q&A',
    'nav.profiles': 'Profiler',
    'nav.company': 'Företag',
    'nav.kb': 'Kunskapsbank',
    'nav.events': 'Händelser',
    'nav.settings': 'Inställningar',

    // Common
    'common.save': 'Spara',
    'common.cancel': 'Avbryt',
    'common.delete': 'Ta bort',
    'common.new': 'Ny',
    'common.none': '— ingen —',
    'common.loading': 'Laddar …',
    'common.error': 'Något gick fel',
    'common.ok': 'OK',

    // QA — titles & labels
    'qa.title': 'Q&A',
    'qa.company': 'Företag',
    'qa.profile': 'Profil',
    'qa.goal': 'Mål',
    'qa.segment': 'Segment',
    'qa.channel': 'Kanal',
    'qa.numbers': 'Siffror',
    'qa.question': 'Fråga / Signal',
    'qa.getAnswer': 'Hämta svar',
    'qa.hint.enter': 'Enter: skicka • Shift+Enter: ny rad',

    // QA — placeholders
    'qa.ph.company': 'Välj företag (valfritt)',
    'qa.ph.profile': 'Välj säljprofil',
    'qa.ph.goal': 'T.ex. ”Boka demo” eller ”Kvalificera”',
    'qa.ph.segment': 'T.ex. ”SMB SaaS i Norden”',
    'qa.ph.channel': 'T.ex. ”E-post”, ”Telefon”, ”LinkedIn”',
    'qa.ph.numbers': 'T.ex. ”3 möten/vecka”, ”CTR 2,1%”',
    'qa.ph.question': 'Skriv din fråga / signal … (Enter skickar, Shift+Enter ny rad)',

    // QA — result blocks
    'qa.res.one_liner': 'One-liner',
    'qa.res.why': 'Varför',
    'qa.res.ack': 'Bekräfta',
    'qa.res.short_script': 'Kort manus',
    'qa.res.full_script': 'Fullt manus',
    'qa.res.math': 'Uträkning',
    'qa.res.next_step': 'Nästa steg',

    // QA — feedback
    'qa.fb.title': 'Feedback',
    'qa.fb.rating': 'Betyg (1–5)',
    'qa.fb.used': 'Användes?',
    'qa.fb.tags': 'Taggar',
    'qa.fb.save': 'Spara feedback',
    'qa.fb.yes': 'Ja',
    'qa.fb.no': 'Nej',

    // QA — location context (NYTT)
    'qa.loc.title': 'Platskontext',
    'qa.loc.segment': 'Segment',
    'qa.loc.nearby': 'I närheten',
    'qa.loc.hooks': 'Krokar',
    'qa.loc.plan': 'Plan',
  },

  en: {
    // App & nav
    'app.title': 'SalesMind',
    'nav.qa': 'Q&A',
    'nav.profiles': 'Profiles',
    'nav.company': 'Company',
    'nav.kb': 'Knowledge Base',
    'nav.events': 'Events',
    'nav.settings': 'Settings',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.new': 'New',
    'common.none': '— none —',
    'common.loading': 'Loading …',
    'common.error': 'Something went wrong',
    'common.ok': 'OK',

    // QA — titles & labels
    'qa.title': 'Q&A',
    'qa.company': 'Company',
    'qa.profile': 'Profile',
    'qa.goal': 'Goal',
    'qa.segment': 'Segment',
    'qa.channel': 'Channel',
    'qa.numbers': 'Numbers',
    'qa.question': 'Question / Signal',
    'qa.getAnswer': 'Get answer',
    'qa.hint.enter': 'Enter: submit • Shift+Enter: new line',

    // QA — placeholders
    'qa.ph.company': 'Choose company (optional)',
    'qa.ph.profile': 'Choose sales profile',
    'qa.ph.goal': 'e.g. “Book demo” or “Qualify”',
    'qa.ph.segment': 'e.g. “SMB SaaS in Nordics”',
    'qa.ph.channel': 'e.g. “Email”, “Phone”, “LinkedIn”',
    'qa.ph.numbers': 'e.g. “3 meetings/week”, “CTR 2.1%”',
    'qa.ph.question': 'Type your question / signal… (Enter submits, Shift+Enter new line)',

    // QA — result blocks
    'qa.res.one_liner': 'One-liner',
    'qa.res.why': 'Why',
    'qa.res.ack': 'Acknowledge',
    'qa.res.short_script': 'Short script',
    'qa.res.full_script': 'Full script',
    'qa.res.math': 'Math',
    'qa.res.next_step': 'Next step',

    // QA — feedback
    'qa.fb.title': 'Feedback',
    'qa.fb.rating': 'Rating (1–5)',
    'qa.fb.used': 'Used?',
    'qa.fb.tags': 'Tags',
    'qa.fb.save': 'Save feedback',
    'qa.fb.yes': 'Yes',
    'qa.fb.no': 'No',

    // QA — location context (NEW)
    'qa.loc.title': 'Location context',
    'qa.loc.segment': 'Segment',
    'qa.loc.nearby': 'Nearby',
    'qa.loc.hooks': 'Hooks',
    'qa.loc.plan': 'Plan',
  },
}

function readCookie(name: string, cookieStr?: string) {
  const source = typeof cookieStr === 'string'
    ? cookieStr
    : (typeof document !== 'undefined' ? document.cookie : '')
  if (!source) return null
  const match = source.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='))
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null
}

export function getLang(cookieStr?: string): Lang {
  const v = readCookie('salesmind_lang', cookieStr)
  if (v === 'en' || v === 'sv') return v
  return 'sv'
}

export function setLangCookie(lang: Lang) {
  if (typeof document === 'undefined') return
  document.cookie = `salesmind_lang=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`
}

export function t(lang: Lang, key: string): string {
  return dict[lang]?.[key] ?? key
}
