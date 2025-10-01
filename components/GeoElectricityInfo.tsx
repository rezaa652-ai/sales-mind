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
      const hasCenter = !!(center && Number.isFinite(center.lat) && Number.isFinite(center.lon));
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
          setState({ loading: false, err: j?.detail || "Kunde inte hämta elinformation" });
          return;
        }
        // Debug (visible in browser console)
        console.log("[GeoElectricityInfo]", j);
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

    const t = setTimeout(run, 200); // small debounce
    return () => { stop = true; clearTimeout(t); };
  }, [address, center?.lat, center?.lon]);

  // UI
  return (
    <div className="mt-2">
      <div className="border rounded-md p-3 bg-white">
        <div className="text-sm font-medium mb-1">Elinformation</div>

        {state.loading && (
          <div className="text-sm text-slate-500">Hämtar elinformation…</div>
        )}

        {state.err && (
          <div className="text-sm text-red-600">{state.err}</div>
        )}

        {!state.loading && !state.err && (
          <div className="text-sm text-slate-800">
            {state.elomrade && (
              <>Elområde: <span className="font-semibold">{state.elomrade}</span></>
            )}
            {state.elnatName && (
              <> • Elnät: <span className="font-semibold">{state.elnatName}</span></>
            )}
            {!state.elnatName && state.dataset === false && (
              <div className="text-xs text-slate-600 mt-1">
                (Installera <code>data/elnat_areas.geojson</code> för lokalt elnät)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
