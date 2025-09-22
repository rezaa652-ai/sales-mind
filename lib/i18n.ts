// lib/i18n.ts
'use client'
export function getLang(): 'sv' | 'en' {
  if (typeof document === 'undefined') return 'sv'
  const m = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/)
  const val = m ? decodeURIComponent(m[1]) : ''
  return val === 'en' ? 'en' : 'sv'
}
type Dict = Record<string, string>
const sv: Dict = {
  qa_title: 'Q&A', company: 'Företag', profile: 'Profil', goal: 'Mål',
  segment: 'Segment', channel: 'Kanal', numbers: 'Siffror',
  question_signal: 'Fråga / Signal',
  question_ph: 'Skriv din fråga eller sälj-signal här…\nTips: Shift+Enter för ny rad. Enter skickar.',
  get_answer: 'Hämta svar', answer_title: 'Svar', one_liner: 'One-liner',
  why: 'Varför', ack: 'Bekräfta', short_script: 'Kort manus',
  full_script: 'Fullt manus', math: 'Uträkning', next_step: 'Nästa steg',
  feedback: 'Feedback', rating: 'Betyg (1–5)', used: 'Användes?',
  yes: 'Ja', no: 'Nej', tags: 'Taggar', save_feedback: 'Spara feedback',
  loading: 'Arbetar…'
}
const en: Dict = {
  qa_title: 'Q&A', company: 'Company', profile: 'Profile', goal: 'Goal',
  segment: 'Segment', channel: 'Channel', numbers: 'Numbers',
  question_signal: 'Question / Signal',
  question_ph: 'Type your question or sales signal here…\nPro tip: Shift+Enter for a new line. Enter submits.',
  get_answer: 'Get Answer', answer_title: 'Answer', one_liner: 'One-liner',
  why: 'Why', ack: 'Acknowledge', short_script: 'Short script',
  full_script: 'Full script', math: 'Math', next_step: 'Next step',
  feedback: 'Feedback', rating: 'Rating (1–5)', used: 'Used?',
  yes: 'Yes', no: 'No', tags: 'Tags', save_feedback: 'Save feedback',
  loading: 'Working…'
}
export function t(key: keyof typeof sv){ return (getLang()==='en'?en:sv)[key] }
