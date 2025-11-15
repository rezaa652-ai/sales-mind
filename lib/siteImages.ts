// lib/siteImages.ts
// Build a public URL for files stored in the Supabase "site" bucket.
// Example: siteImageUrl('hero.jpg') -> https://.../storage/v1/object/public/site/hero.jpg

const base = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

export function siteImageUrl(path: string) {
  const p = String(path || '').replace(/^\/+/, '');
  if (!base) return '';
  return `${base}/storage/v1/object/public/site/${p}`;
}
