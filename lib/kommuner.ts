import { KOMMUNER } from '../data/kommuner'

/** Map both Swedish and English names -> kommun code */
const nameToCode: Record<string, string> = {}
for (const k of KOMMUNER) {
  if (k.name_sv) nameToCode[k.name_sv] = k.code
  if (k.name_en) nameToCode[k.name_en] = k.code
}

/** Backward-compatible export name expected by your code */
export const KOMMUN_CODE_BY_NAME = nameToCode

/** Extra helpers if you need them later */
export const KOMMUN_BY_CODE = new Map(KOMMUNER.map(k => [k.code, k]))
export function kommunCodeFromName(input: string | undefined | null): string | undefined {
  if (!input) return
  const s = input.trim()
  if (/^\d{4}$/.test(s)) return s
  return nameToCode[s] || nameToCode[s.normalize('NFKC')]
}

export { KOMMUNER }
