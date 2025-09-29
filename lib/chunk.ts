// lib/chunk.ts
export function chunkText(text: string, maxChars = 1200): string[] {
  const parts:string[] = []
  let buf = ''
  for (const line of text.split(/\n+/)) {
    if ((buf + '\n' + line).length > maxChars) {
      if (buf.trim()) parts.push(buf.trim())
      buf = line
    } else {
      buf = buf ? buf + '\n' + line : line
    }
  }
  if (buf.trim()) parts.push(buf.trim())
  return parts
}
