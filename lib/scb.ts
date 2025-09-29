export type PxQuery = {
  query: Array<{ code: string; selection: { filter: string; values: string[] } }>;
  response?: { format: 'JSON' | 'PX' };
};

export async function pxwebFetch(baseUrl: string, body: PxQuery) {
  // Example baseUrl:
  //  "https://api.scb.se/OV0104/v1/doris/sv/ssd/HE/HE0110/HE0110A/DispInkMedelKomÅlder"
  // You control exact dataset path via env.
  const r = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...body,
      response: { format: 'JSON' },
    }),
    // Node fetch
    cache: 'no-store'
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`SCB HTTP ${r.status}: ${text}`);
  }
  return r.json();
}
