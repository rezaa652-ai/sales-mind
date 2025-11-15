/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'

const BUSINESS_TYPES = [
  'restaurant','cafe','bar','bakery','meal_takeaway','meal_delivery',
  'supermarket','convenience_store','shopping_mall','department_store',
  'clothing_store','shoe_store','jewelry_store','furniture_store','electronics_store',
  'hardware_store','bicycle_store','book_store','florist','beauty_salon','hair_care',
  'pharmacy','doctor','dentist','veterinary_care',
  'bank','atm','car_rental','car_repair','car_dealer',
  'gas_station','electric_vehicle_charging_station','lodging'
];

function metersBetween(lat1:number, lon1:number, lat2:number, lon2:number){
  const toRad = (d:number)=>d*Math.PI/180;
  const R = 6371000;
  const dLat = toRad(lat2-lat1);
  const dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}

// Map Google type -> localized label (sv/en)
function typeLabel(lang:'sv'|'en', t?:string){
  if(!t) return undefined;
  const map_sv: Record<string,string> = {
    restaurant:'restaurang', cafe:'café', bar:'bar', bakery:'bageri', meal_takeaway:'hämtmat',
    meal_delivery:'matleverans', supermarket:'stormarknad',
    convenience_store:'närbutik', shopping_mall:'galleria', department_store:'varuhus',
    clothing_store:'klädaffär', shoe_store:'skobutik', jewelry_store:'smyckesbutik',
    furniture_store:'möbelbutik', electronics_store:'hemelektronik',
    hardware_store:'järnhandel', bicycle_store:'cykelbutik', book_store:'bokhandel', florist:'blomsterhandel',
    beauty_salon:'skönhetssalong', hair_care:'frisör', pharmacy:'apotek',
    doctor:'läkare', dentist:'tandläkare', veterinary_care:'veterinär',
    bank:'bank', atm:'bankomat',
    car_rental:'biluthyrning', car_repair:'bilverkstad', car_dealer:'bilhandlare',
    gas_station:'bensinstation', electric_vehicle_charging_station:'laddstation',
    lodging:'hotell'
  };
  if(lang==='sv') return map_sv[t] || t;
  return (t || '').replace(/_/g,' ');
}

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'missing_api_key' }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const address   = (searchParams.get('address') || '').trim();
    const radius_m  = Math.max(100, Math.min(3000, Number(searchParams.get('radius_m')||600)));
    const lang = (searchParams.get('lang') || 'sv').toLowerCase() === 'en' ? 'en' : 'sv';

    if (!address) return NextResponse.json({ error: 'missing address' }, { status: 400 });

    // 1) Geocode (v3)
    const geoURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&language=${lang}`;
    const geo = await fetch(geoURL, { cache: 'no-store' }).then(r=>r.json());
    if (geo.status !== 'OK' || !geo.results?.length) {
      return NextResponse.json({
        error: 'not_found',
        provider_status: geo.status,
        provider_error: geo.error_message || null
      }, { status: 404 });
    }
    const g0 = geo.results[0];
    const loc = g0.geometry.location; // { lat, lng }

    // 2) Places Nearby (v1 NEW)
    const fieldMask = [
      'places.displayName',
      'places.primaryType',
      'places.types',
      'places.location',
      'places.rating',
      'places.formattedAddress'
    ].join(',');

    // Remove unsupported type "grocery_or_supermarket" (legacy)
    const includedTypes = BUSINESS_TYPES;

    const placesResp = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask
      },
      body: JSON.stringify({
        languageCode: lang,
        locationRestriction: {
          circle: { center: { latitude: loc.lat, longitude: loc.lng }, radius: radius_m }
        },
        includedTypes
      })
    }).then(r=>r.json());

    if (placesResp.error) {
      return NextResponse.json({
        error: 'places_denied',
        provider_status: placesResp.error.status || 'ERROR',
        provider_error: placesResp.error.message || null
      }, { status: 403 });
    }

    const results = Array.isArray(placesResp.places) ? placesResp.places : [];
    const pois = results.map((p:any)=>{
      const plat = p.location?.latitude;
      const plon = p.location?.longitude;
      const dist = (typeof plat==='number' && typeof plon==='number')
        ? Math.round(metersBetween(loc.lat, loc.lng, plat, plon))
        : undefined;

      // prefer primaryType then types[0]
      const rawType: string | undefined = p.primaryType || (Array.isArray(p.types) ? p.types[0] : undefined);
      return {
        name: p.displayName?.text || '—',
        type: typeLabel(lang, rawType),
        distance_m: dist,
        lat: plat,
        lon: plon,
        rating: p.rating,
        address: p.formattedAddress || undefined
      };
    }).sort((a:any,b:any)=>(a.distance_m??9e9)-(b.distance_m??9e9));

    const segment = lang === 'en' ? 'Residential / mixed amenities' : 'Bostadsområde / blandad service';
    const plan = lang === 'en'
      ? ['Highlight transparent pricing & easy signup', 'Use neighborhood-tailored content (welcome email)']
      : ['Lyft fram transparent prissättning & enkel signup', 'Använd områdesanpassat innehåll (välkomstmail)'];
    const hooks = lang === 'en'
      ? ['Reference familiar nearby spots if relevant', 'Offer EV/off-peak if chargers present']
      : ['Referera till välkända närliggande platser vid behov', 'Erbjud elbil/off-peak om laddare finns'];

    // IMPORTANT: No mock demographics here anymore.
    return NextResponse.json({
      center: { lat: loc.lat, lon: loc.lng },
      address,
      radius_m,
      pois,
      segment, plan, hooks,
      lang,
      // Pass geocode address components so the UI can infer kommun name -> code
      components: Array.isArray(g0.address_components) ? g0.address_components : []
    });
  } catch (e:any) {
    return NextResponse.json({ error: 'server_error', detail: e?.message }, { status: 500 });
  }
}
