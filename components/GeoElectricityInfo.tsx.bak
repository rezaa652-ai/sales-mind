"use client";
import React from "react";

type Center = { lat: number; lon: number };
export default function GeoElectricityInfo({
  address,
  center
}: {
  address?: string;
  center?: Center | null;
}) {
  const [state, setState] = React.useState<{
    loading: boolean;
    elomrade?: string;
    elnatName?: string;
    dataset?: boolean;
    err?: string;
  }>({ loading: false });

  React.useEffect(() => {
    let stop = false;

    async function run() {
      const hasCenter = center && Number.isFinite(center.lat) && Number.isFinite(center.lon);
      const hasAddress = !!(address && address.trim());
      if (!hasCenter && !hasAddress) {
        setState({ loading: false });
        return;
      }
      setState(s => ({ ...s, loading: true, err: undefined }));
      try {
        const qs = hasCenter
          ? `lat=${encodeURIComponent(String(center!.lat))}&lon=${encodeURIComponent(String(center!.lon))}`
          : `address=${encodeURIComponent(address!.trim())}`;
        const r = await fetch(`/api/geo/electricity?${qs}`, { cache: "no-store" });
        const j = await r.json().catch(() => null);
        if (stop) return;
        if (!r.ok || !j?.ok) {
          setState({ loading: false, err: j?.detail || "Kunde inte hämta eldata" });
          return;
        }
        setState({
          loading: false,
          elomrade: j.elomrade,
          elnatName: j.elnat?.name || undefined,
          dataset: !!j.dataset_present
        });
      } catch (e: any) {
        if (!stop) setState({ loading: false, err: e?.message || "Nätverksfel" });
      }
    }

    const t = setTimeout(run, 350); // mild debounce while typing
    return () => { stop = true; clearTimeout(t); };
  }, [address, center?.lat, center?.lon]);

  if (state.loading) {
    return <div className="text-xs text-slate-500 mt-1">Hämtar elinformation…</div>;
  }
  if (state.err) {
    return <div className="text-xs text-red-600 mt-1">{state.err}</div>;
  }
  if (!state.elomrade && !state.elnatName) return null;

  return (
    <div className="text-xs text-slate-700 mt-1">
      {state.elomrade && <>Elområde: <span className="font-medium">{state.elomrade}</span></>}
      {state.elnatName && <> • Elnät: <span className="font-medium">{state.elnatName}</span></>}
      {!state.elnatName && state.dataset === false && (
        <> • (Installera <code>data/elnat_areas.geojson</code> för lokalt elnät)</>
      )}
    </div>
  );
}
