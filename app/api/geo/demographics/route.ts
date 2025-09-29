import { NextRequest, NextResponse } from 'next/server'
import { KOMMUN_CODE_BY_NAME } from '@/lib/kommuner'
import { pxwebFetch } from '@/lib/scb'

/**
 * ENV you can set (dev: .env.local, prod: Vercel envs)
 *
 * SCB_DATASET_URL=
 *   Full PXWeb endpoint URL to a dataset that has:
 *   - Region (kommun) variable
 *   - Age variable
 *   - A measure/indicator we can read (e.g., median income)
 *
 *   Example (NOTE: this is just an illustrative path — pick the actual one you want from SCB):
 *   https://api.scb.se/OV0104/v1/doris/sv/ssd/HE/HE0110/HE0110A/DispInkKomMedianK
 *
 * SCB_REGION_CODE=     # e.g. "Region"
 * SCB_AGE_CODE=        # e.g. "Alder"
 * SCB_MEASURE_CODE=    # e.g. "ContentsCode" OR a fixed measure var you include in the query
 * SCB_MEASURE_VALUE=   # e.g. "HE0110KM"  (depends on dataset)
 *
 * AGE bucket mapping (we’ll request a compact set like 20–29, 30–44, 45–64, 65+).
 * You must use values that exist in your chosen dataset.
 *
 * If env is NOT set, we return a clean mocked response so UI still works.
 */

function parseMunicipalityNameFromGoogle(components: any[]): string | null {
  // Try locality first; fallback to postal_town
  const get = (type: string) =>
    components.find((c: any) => (c.types || []).includes(type))?.long_name || null;
  return get('locality') || get('postal_town') || null;
}

// Translate Google lang to sv/en
function pickLocale(searchParams: URLSearchParams) {
  const l = (searchParams.get('lang') || 'sv').toLowerCase();
  return l === 'en' ? 'en' : 'sv';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = pickLocale(searchParams);
    const address = searchParams.get('address') || '';
    if (!address.trim()) {
      return NextResponse.json({ error: 'missing address' }, { status: 400 });
    }

    // 1) Geocode with Google to get municipality name
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'missing_google_key' }, { status: 500 });

    const geoURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const geo = await fetch(geoURL).then(r => r.json());
    if (geo.status !== 'OK' || !geo.results?.length) {
      return NextResponse.json({
        error: 'geocode_not_found',
        provider_status: geo.status,
        provider_error: geo.error_message || null
      }, { status: 404 });
    }
    const comp = geo.results[0]?.address_components || [];
    const municipalityName = parseMunicipalityNameFromGoogle(comp);
    const country = comp.find((c:any)=> (c.types||[]).includes('country'))?.short_name || null;

    // 2) If not Sweden, or we fail to detect municipality → return mock (so UI still works)
    if (country !== 'SE' || !municipalityName) {
      const mock = lang === 'en'
        ? {
            source: 'mock',
            municipality: municipalityName || '—',
            demographics: {
              buckets: [
                { age: '20–29', median_income: '240 000 SEK' },
                { age: '30–44', median_income: '310 000 SEK' },
                { age: '45–64', median_income: '340 000 SEK' },
                { age: '65+',   median_income: '270 000 SEK' },
              ]
            }
          }
        : {
            källa: 'mock',
            kommun: municipalityName || '—',
            demografi: {
              ålder_inkomst: [
                { ålder: '20–29', medianinkomst: '240 000 kr' },
                { ålder: '30–44', medianinkomst: '310 000 kr' },
                { ålder: '45–64', medianinkomst: '340 000 kr' },
                { ålder: '65+',   medianinkomst: '270 000 kr' },
              ]
            }
          };
      return NextResponse.json(mock);
    }

    const kommunCode = KOMMUN_CODE_BY_NAME[municipalityName] || null;
    const datasetUrl = process.env.SCB_DATASET_URL;
    const REGION = process.env.SCB_REGION_CODE || 'Region';
    const AGE    = process.env.SCB_AGE_CODE    || 'Alder';
    const MEAS   = process.env.SCB_MEASURE_CODE || 'ContentsCode';
    const MEAS_V = process.env.SCB_MEASURE_VALUE || ''; // optional

    // 3) If no dataset configured or kommun code missing, return mock
    if (!datasetUrl || !kommunCode) {
      const mock = lang === 'en'
        ? {
            source: 'mock',
            municipality: municipalityName,
            demographics: {
              buckets: [
                { age: '20–29', median_income: '240 000 SEK' },
                { age: '30–44', median_income: '310 000 SEK' },
                { age: '45–64', median_income: '340 000 SEK' },
                { age: '65+',   median_income: '270 000 SEK' },
              ]
            }
          }
        : {
            källa: 'mock',
            kommun: municipalityName,
            demografi: {
              ålder_inkomst: [
                { ålder: '20–29', medianinkomst: '240 000 kr' },
                { ålder: '30–44', medianinkomst: '310 000 kr' },
                { ålder: '45–64', medianinkomst: '340 000 kr' },
                { ålder: '65+',   medianinkomst: '270 000 kr' },
              ]
            }
          };
      return NextResponse.json(mock);
    }

    // 4) Build a PXWeb query (example age buckets — must exist in your chosen dataset)
    // Replace the AGE values with the dataset's actual codes/labels.
    const ageValues = ['20-29', '30-44', '45-64', '65+'];

    const query = {
      query: [
        { code: REGION, selection: { filter: 'item', values: [kommunCode] } },
        { code: AGE,    selection: { filter: 'item', values: ageValues } },
        ...(MEAS_V ? [{ code: MEAS, selection: { filter: 'item', values: [MEAS_V] } }] : []),
      ]
    };

    const json = await pxwebFetch(datasetUrl, query as any);

    // 5) Parse PXWeb JSON: values align with query order
    // We map them back to our 4 age buckets.
    const values: (number|string)[] = json?.data?.map((d: any) => d?.values?.[0]) || [];
    const parsed = ageValues.map((age, i) => {
      const v = values[i];
      const n = typeof v === 'string' ? Number(v.replace(/\s+/g, '')) : (typeof v === 'number' ? v : null);
      return { age, median_income_value: n };
    });

    const payload = lang === 'en'
      ? {
          source: 'scb',
          municipality: municipalityName,
          demographics: {
            buckets: parsed.map(b => ({
              age: b.age,
              median_income: (b.median_income_value != null)
                ? `${Math.round(b.median_income_value).toLocaleString('sv-SE')} SEK`
                : '—'
            }))
          }
        }
      : {
          källa: 'scb',
          kommun: municipalityName,
          demografi: {
            ålder_inkomst: parsed.map(b => ({
              ålder: b.age.replace('-', '–'),
              medianinkomst: (b.median_income_value != null)
                ? `${Math.round(b.median_income_value).toLocaleString('sv-SE')} kr`
                : '—'
            }))
          }
        };

    return NextResponse.json(payload);

  } catch (e:any) {
    return NextResponse.json({ error: 'server_error', detail: e?.message }, { status: 500 })
  }
}
