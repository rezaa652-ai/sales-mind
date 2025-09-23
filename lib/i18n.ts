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
    'common.edit': 'Redigera',
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
    'qa.ph.goal': 'T.ex. “Boka demo” eller “Kvalificera”',
    'qa.ph.segment': 'T.ex. “SMB SaaS i Norden”',
    'qa.ph.channel': 'T.ex. “E-post”, “Telefon”, “LinkedIn”',
    'qa.ph.numbers': 'T.ex. “3 möten/vecka”, “CTR 2.1%”',
    'qa.ph.question': 'Skriv din fråga / signal… (Enter skickar, Shift+Enter ny rad)',

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

    // Settings — menu
    'settings.menu.profile': 'Profil',
    'settings.menu.billing': 'Fakturering',
    'settings.menu.language': 'Språk',
    'settings.logout': 'Logga ut',

    // Settings — profile
    'settings.profile.title': 'Profil',
    'settings.profile.email': 'E-post',
    'settings.profile.password': 'Lösenord',
    'settings.profile.newEmailPH': 'Ny e-postadress',
    'settings.profile.newPassPH': 'Nytt lösenord (minst 6 tecken)',
    'settings.profile.updateEmail': 'Uppdatera e-post',
    'settings.profile.updatePassword': 'Uppdatera lösenord',
    'settings.profile.status.saving': 'Sparar …',
    'settings.profile.status.done': 'Klart!',
    'settings.profile.status.err': 'Kunde inte uppdatera',

    // Settings — billing
    'settings.billing.title': 'Fakturering',
    'settings.billing.currentPlan': 'Nuvarande plan',
    'settings.billing.free': 'Free',
    'settings.billing.upgrade': 'Uppgradera',
    'settings.billing.manage': 'Hantera fakturering',

    // Settings — language
    'settings.language.title': 'Språk',
    'settings.language.choose': 'Välj språk för appen',
    'settings.language.sv': 'Svenska',
    'settings.language.en': 'Engelska',
    'settings.language.save': 'Spara språk',
    'settings.language.cancel': 'Avbryt',

    // Profiles page
    'profiles.title': 'Profiler',
    'profiles.new': 'Ny profil',
    'profiles.table.name': 'Namn',
    'profiles.table.language': 'Språk',
    'profiles.table.tone': 'Ton',
    'profiles.table.company': 'Företag',
    'profiles.modal.new': 'Ny profil',
    'profiles.modal.edit': 'Redigera profil',
    'profiles.field.name': 'Namn',
    'profiles.field.language': 'Språk',
    'profiles.field.tone': 'Ton',
    'profiles.field.callback': 'Callback-fönster',
    'profiles.field.goals': 'Mål',
    'profiles.field.targets': 'Säljtarget',
    'profiles.field.persona': 'Persona-hints',
    'profiles.field.compliance': 'Compliance',
    'profiles.field.proof': 'Proof',
    'profiles.field.company': 'Företag',
    'profiles.ph.name': 'T.ex. “SDR – Nordics”',
    'profiles.ph.language': 'Svenska / Engelska',
    'profiles.ph.tone': 'Konkret, vänlig, kort',
    'profiles.ph.callback': '12:15,16:40',
    'profiles.ph.goals': 'Avslut|Boka|Kvalificera',
    'profiles.ph.targets': '3 meetings/day',
    'profiles.ph.persona': 'Snabb, tydlig, resultatinriktad',
    'profiles.ph.compliance': 'Policy eller text…',
    'profiles.ph.proof': 'Case, siffror, social proof…',

    // Company page
    'company.title': 'Företag',
    'company.new': 'Nytt företag',
    'company.table.name': 'Namn',
    'company.table.market': 'Marknad',
    'company.table.features': 'Features',
    'company.modal.new': 'Nytt företag',
    'company.modal.edit': 'Redigera företag',
    'company.field.name': 'Företagsnamn',
    'company.field.market': 'Marknad',
    'company.field.geo': 'Geo-noteringar',
    'company.field.products': 'Produkter',
    'company.field.features': 'Unika features',
    'company.field.compliance': 'Compliance',
    'company.field.proof': 'Proof points',
    'company.field.links': 'Publika länkar',
    'company.field.disclaimer': 'Disclaimer',
    'company.ph.name': 'Acme AB',
    'company.ph.market': 'SaaS / Retail / Industri …',
    'company.ph.geo': 'Norden, EU, USA …',
    'company.ph.products': 'Produktlista…',
    'company.ph.features': 'Unikt värde…',
    'company.ph.compliance': 'Policyer, krav …',
    'company.ph.proof': 'Case, siffror …',
    'company.ph.links': 'https://…',
    'company.ph.disclaimer': 'Kort juridisk text…',

    // KB page
    'kb.title': 'Kunskapsbank',
    'kb.new': 'Ny entry',
    'kb.table.signal': 'Signal',
    'kb.table.best': 'Best practice',
    'kb.table.profile': 'Profil',
    'kb.modal.new': 'Ny KB entry',
    'kb.modal.edit': 'Redigera KB entry',
    'kb.field.signal': 'Signal',
    'kb.field.best': 'Best practice',
    'kb.field.profile': 'Profil',
    'kb.ph.signal': 'Kund säger: “…”',
    'kb.ph.best': 'Svara så här …',
    'kb.ph.profile': 'Valfri profil',

    // Events page
    'events.title': 'Händelser',
    'events.table.when': 'När',
    'events.table.profile': 'Profil',
    'events.table.question': 'Fråga',
    'events.table.rating': 'Betyg',
    'events.table.used': 'Användes',
    'events.table.tags': 'Taggar',
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
    'common.edit': 'Edit',
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
    'qa.getAnswer': 'Get Answer',
    'qa.hint.enter': 'Enter: submit • Shift+Enter: new line',

    // QA — placeholders
    'qa.ph.company': 'Pick a company (optional)',
    'qa.ph.profile': 'Choose sales profile',
    'qa.ph.goal': 'E.g. “Book a demo” or “Qualify”',
    'qa.ph.segment': 'E.g. “SMB SaaS in Nordics”',
    'qa.ph.channel': 'E.g. “Email”, “Phone”, “LinkedIn”',
    'qa.ph.numbers': 'E.g. “3 meetings/week”, “CTR 2.1%”',
    'qa.ph.question': 'Type your question / signal… (Enter submits, Shift+Enter newline)',

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

    // Settings — menu
    'settings.menu.profile': 'Profile',
    'settings.menu.billing': 'Billing',
    'settings.menu.language': 'Language',
    'settings.logout': 'Log out',

    // Settings — profile
    'settings.profile.title': 'Profile',
    'settings.profile.email': 'Email',
    'settings.profile.password': 'Password',
    'settings.profile.newEmailPH': 'New email address',
    'settings.profile.newPassPH': 'New password (min 6 chars)',
    'settings.profile.updateEmail': 'Update email',
    'settings.profile.updatePassword': 'Update password',
    'settings.profile.status.saving': 'Saving …',
    'settings.profile.status.done': 'Done!',
    'settings.profile.status.err': 'Could not update',

    // Settings — billing
    'settings.billing.title': 'Billing',
    'settings.billing.currentPlan': 'Current plan',
    'settings.billing.free': 'Free',
    'settings.billing.upgrade': 'Upgrade',
    'settings.billing.manage': 'Manage billing',

    // Settings — language
    'settings.language.title': 'Language',
    'settings.language.choose': 'Choose the app language',
    'settings.language.sv': 'Swedish',
    'settings.language.en': 'English',
    'settings.language.save': 'Save language',
    'settings.language.cancel': 'Cancel',

    // Profiles page
    'profiles.title': 'Profiles',
    'profiles.new': 'New profile',
    'profiles.table.name': 'Name',
    'profiles.table.language': 'Language',
    'profiles.table.tone': 'Tone',
    'profiles.table.company': 'Company',
    'profiles.modal.new': 'New profile',
    'profiles.modal.edit': 'Edit profile',
    'profiles.field.name': 'Name',
    'profiles.field.language': 'Language',
    'profiles.field.tone': 'Tone',
    'profiles.field.callback': 'Callback windows',
    'profiles.field.goals': 'Goals',
    'profiles.field.targets': 'Sales targets',
    'profiles.field.persona': 'Persona hints',
    'profiles.field.compliance': 'Compliance',
    'profiles.field.proof': 'Proof',
    'profiles.field.company': 'Company',
    'profiles.ph.name': 'e.g. “SDR – Nordics”',
    'profiles.ph.language': 'Swedish / English',
    'profiles.ph.tone': 'Concise, friendly, brief',
    'profiles.ph.callback': '12:15,16:40',
    'profiles.ph.goals': 'Close|Book|Qualify',
    'profiles.ph.targets': '3 meetings/day',
    'profiles.ph.persona': 'Fast, clear, results-driven',
    'profiles.ph.compliance': 'Policy or text…',
    'profiles.ph.proof': 'Cases, numbers, social proof…',

    // Company page
    'company.title': 'Company',
    'company.new': 'New company',
    'company.table.name': 'Name',
    'company.table.market': 'Market',
    'company.table.features': 'Features',
    'company.modal.new': 'New company',
    'company.modal.edit': 'Edit company',
    'company.field.name': 'Company name',
    'company.field.market': 'Market',
    'company.field.geo': 'Geo notes',
    'company.field.products': 'Products',
    'company.field.features': 'Unique features',
    'company.field.compliance': 'Compliance',
    'company.field.proof': 'Proof points',
    'company.field.links': 'Public links',
    'company.field.disclaimer': 'Disclaimer',
    'company.ph.name': 'Acme Inc.',
    'company.ph.market': 'SaaS / Retail / Industrial …',
    'company.ph.geo': 'Nordics, EU, USA …',
    'company.ph.products': 'Product list…',
    'company.ph.features': 'Unique value…',
    'company.ph.compliance': 'Policies, requirements …',
    'company.ph.proof': 'Cases, numbers …',
    'company.ph.links': 'https://…',
    'company.ph.disclaimer': 'Short legal text…',

    // KB page
    'kb.title': 'Knowledge Base',
    'kb.new': 'New entry',
    'kb.table.signal': 'Signal',
    'kb.table.best': 'Best practice',
    'kb.table.profile': 'Profile',
    'kb.modal.new': 'New KB entry',
    'kb.modal.edit': 'Edit KB entry',
    'kb.field.signal': 'Signal',
    'kb.field.best': 'Best practice',
    'kb.field.profile': 'Profile',
    'kb.ph.signal': 'Customer says: “…”',
    'kb.ph.best': 'Answer like this …',
    'kb.ph.profile': 'Optional profile',

    // Events page
    'events.title': 'Events',
    'events.table.when': 'When',
    'events.table.profile': 'Profile',
    'events.table.question': 'Question',
    'events.table.rating': 'Rating',
    'events.table.used': 'Used',
    'events.table.tags': 'Tags',
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
