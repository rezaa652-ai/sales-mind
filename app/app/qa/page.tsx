"use client";

import React, { useEffect, useMemo, useState, KeyboardEvent } from "react";
import GeoElectricityInfo from "@/components/GeoElectricityInfo";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

type Item = { id: string; name: string };

// ------- Geo types (same shape as /api/geo/pois) -------
type Lang = "sv" | "en";
type Poi = {
  name: string;
  type?: string;
  distance_m?: number;
  lat: number;
  lon: number;
  rating?: number;
  address?: string;
};
type GeoResp = {
  center?: { lat: number; lon: number };
  address?: string;
  radius_m?: number;
  pois?: Poi[];
  segment?: string;
  plan?: string[];
  hooks?: string[];
  demographics?: { median_income?: string; families?: string; students?: string };
  lang?: Lang;
};

// ---------- Little helpers ----------
function StarRating({
  value,
  onChange,
  onEnter,
}: {
  value: number;
  onChange: (v: number) => void;
  onEnter?: () => void;
}) {
  return (
    <div
      className="flex gap-1 items-center text-xl select-none"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onEnter) onEnter();
        if (e.key === "ArrowRight") onChange(Math.min(5, (value || 0) + 1));
        if (e.key === "ArrowLeft") onChange(Math.max(1, (value || 0) - 1));
      }}
      aria-label="Betyg 1–5"
      role="radiogroup"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="px-1"
          onClick={() => onChange(n)}
          aria-checked={value === n}
          role="radio"
          title={`${n}/5`}
        >
          {n <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}

function AnswerBlock({
  title,
  text,
  onCopy,
  liked,
  onLike,
  onDislike,
}: {
  title: string;
  text: string;
  onCopy: () => void;
  liked: "like" | "dislike" | "";
  onLike: () => void;
  onDislike: () => void;
}) {
  if (!text) return null;
  return (
    <div className="border rounded p-3 bg-white">
      <div className="font-medium mb-2">{title}</div>
      <div className="whitespace-pre-wrap text-sm leading-relaxed">{text}</div>
      <div className="flex gap-3 mt-3 text-sm">
        <button type="button" onClick={onCopy} className="px-2 py-1 border rounded">
          📋 Kopiera
        </button>
        <button
          type="button"
          onClick={onLike}
          className={`px-2 py-1 border rounded ${liked === "like" ? "bg-green-50" : ""}`}
        >
          👍 Gilla
        </button>
        <button
          type="button"
          onClick={onDislike}
          className={`px-2 py-1 border rounded ${liked === "dislike" ? "bg-red-50" : ""}`}
        >
          👎 Ogilla
        </button>
      </div>
    </div>
  );
}

export default function QAPage() {
  // Language toggle
  const [lang, setLang] = useState<"sv" | "en">("sv");

  // Select data
  const [companies, setCompanies] = useState<Item[]>([]);
  const [profiles, setProfiles] = useState<Item[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [profileId, setProfileId] = useState("");

  // Inputs
  const GOAL_OPTS = useMemo(
    () => ["Kvalificera", "Boka samtal/tid senare", "Sälj/Avslut"],
    []
  );
  const SEG_OPTS = useMemo(
    () => ["Enpersonshushåll", "Tvåpersonshushåll", "Familjehushåll"],
    []
  );
  const CHANNEL_OPTS = useMemo(() => ["Telefon", "SMS", "E-post"], []);

  const [goal, setGoal] = useState("");
  const [segment, setSegment] = useState("");
  const [channel, setChannel] = useState("");

  const [valueLine, setValueLine] = useState(""); // “Värderad rad (valfritt)”
  const [address, setAddress] = useState("");
  const [question, setQuestion] = useState("");

  // Submit state
  const [submitting, setSubmitting] = useState(false);

  // Outputs
  const [oneLiner, setOneLiner] = useState("");
  const [why, setWhy] = useState("");
  const [ack, setAck] = useState("");
  const [shortScript, setShortScript] = useState("");
  const [fullScript, setFullScript] = useState("");
  const [math, setMath] = useState("");
  const [nextStep, setNextStep] = useState("");

  // Feedback state per block
  const [likes, setLikes] = useState<Record<string, "like" | "dislike" | "">>({
    one_liner: "",
    why: "",
    ack: "",
    short_script: "",
    full_script: "",
    math: "",
    next_step: "",
  });
  const [rating, setRating] = useState(0);

  // Companies & profiles
  useEffect(() => {
    (async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          fetch("/api/qa/companies").then((r) => r.json()).catch(() => ({ items: [] })),
          fetch("/api/qa/profiles").then((r) => r.json()).catch(() => ({ items: [] })),
        ]);
        setCompanies(Array.isArray(cRes.items) ? cRes.items : []);
        setProfiles(Array.isArray(pRes.items) ? pRes.items : []);
      } catch {
        setCompanies([]);
        setProfiles([]);
      }
    })();
  }, []);

  const onKeyDownSubmit = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  // --------- NEW: geo state + map loader ----------
  const [geo, setGeo] = useState<GeoResp | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | undefined>(undefined);
  const { isLoaded: mapLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  async function fetchGeoIfAddress() {
    if (!address.trim()) {
      setGeo(null);
      setGeoError(undefined);
      return;
    }
    try {
      setGeoLoading(true);
      setGeoError(undefined);
      setGeo(null);
      const r = await fetch(
        `/api/geo/pois?address=${encodeURIComponent(address)}&radius_m=600&lang=${lang}`,
        { cache: "no-store" }
      );
      if (!r.ok) {
        const tx = await r.text().catch(() => "");
        throw new Error(tx || `HTTP ${r.status}`);
      }
      const json: GeoResp = await r.json();
      setGeo(json);
    } catch (e: any) {
      setGeoError(e?.message || "geo_failed");
    } finally {
      setGeoLoading(false);
    }
  }

  async function onSubmit() {
    if (submitting) return;
    if (!question.trim()) return;
    setSubmitting(true);

    // Kick off geo fetch in parallel (if address present)
    const geoPromise = fetchGeoIfAddress();

    try {
      const res = await fetch("/api/qa/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          companyId: companyId || undefined,
          profileId: profileId || undefined,
          goal: goal || undefined,
          segment: segment || undefined,
          channel: channel || undefined,
          valueLine: valueLine || undefined,
          address: address || undefined,
          question: question.trim(),
        }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j?.ok) {
        console.error("ask failed", j);
        return;
      }
      setOneLiner(j.one_liner || "");
      setWhy(j.why || "");
      setAck(j.ack || "");
      setShortScript(j.short_script || "");
      setFullScript(j.full_script || "");
      setMath(j.math || "");
      setNextStep(j.next_step || "");
      // reset feedback
      setLikes({
        one_liner: "",
        why: "",
        ack: "",
        short_script: "",
        full_script: "",
        math: "",
        next_step: "",
      });
      setRating(0);
    } finally {
      // Ensure geo finished too (even if ask failed)
      await geoPromise.catch(() => {});
      setSubmitting(false);
    }
  }

  const copyText = async (t: string) => {
    try {
      await navigator.clipboard.writeText(t || "");
    } catch {}
  };

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <div className="text-sm font-medium text-slate-700 mb-1">{children}</div>
  );

  // ---- map helpers ----
  const center = geo?.center ? { lat: geo.center.lat, lng: geo.center.lon } : undefined;
  const hasPois = Array.isArray(geo?.pois) && (geo?.pois?.length || 0) > 0;
  const greenIcon = {
    url: "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png",
    scaledSize: { width: 32, height: 32 } as unknown as google.maps.Size,
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Q&amp;A</h1>
        <div className="flex gap-2">
          <button
            type="button"
            className={`px-3 py-1 rounded border ${lang === "sv" ? "bg-slate-900 text-white" : ""}`}
            onClick={() => setLang("sv")}
          >
            SV
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded border ${lang === "en" ? "bg-slate-900 text-white" : ""}`}
            onClick={() => setLang("en")}
          >
            EN
          </button>
        </div>
      </div>

      {/* Row 1: Company + Profile */}
      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <div>
          <FieldLabel>Företag</FieldLabel>
          <select
            className="w-full border rounded px-3 py-2"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            onKeyDown={onKeyDownSubmit}
          >
            <option value="">{lang === "en" ? "Select company…" : "Välj företag…"}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel>Profil</FieldLabel>
          <select
            className="w-full border rounded px-3 py-2"
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            onKeyDown={onKeyDownSubmit}
          >
            <option value="">{lang === "en" ? "Select profile…" : "Välj profil…"}</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Goal + Segment + Channel */}
      <div className="grid md:grid-cols-3 gap-3 mb-3">
        <div>
          <FieldLabel>Mål (valfritt)</FieldLabel>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={onKeyDownSubmit}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">{lang === "en" ? "Select goal…" : "Välj mål…"}</option>
            {GOAL_OPTS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel>Segment (valfritt)</FieldLabel>
          <select
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            onKeyDown={onKeyDownSubmit}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">{lang === "en" ? "Select segment…" : "Välj segment…"}</option>
            {SEG_OPTS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel>Kanal (valfritt)</FieldLabel>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            onKeyDown={onKeyDownSubmit}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">{lang === "en" ? "Select channel…" : "Välj kanal…"}</option>
            {CHANNEL_OPTS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: Value line + Address */}
      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <div>
          <FieldLabel>Värderad rad (valfritt)</FieldLabel>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder={
              lang === "en"
                ? "Example: reduce your electricity bill up to 30 percent per month"
                : "Exempel: sänk din elräkning upp till 30 % per månad"
            }
            value={valueLine}
            onChange={(e) => setValueLine(e.target.value)}
            onKeyDown={onKeyDownSubmit}
          />
        </div>

        <div>
          <FieldLabel>Adress (valfritt)</FieldLabel>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder={
              lang === "en"
                ? "Example: Södra Förstadsgatan 1, Malmö"
                : "Exempel: Södra Förstadsgatan 1, Malmö"
            }
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={onKeyDownSubmit}
          />
        </div>
      </div>

      {/* Row 4: Question full width */}
      <div className="mb-2">
        <FieldLabel>Fråga / Signal</FieldLabel>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[90px]"
          placeholder={
            lang === "en"
              ? 'How do I handle "I don’t have time"?'
              : 'Hur hanterar jag ”jag har inte tid”?'
          }
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
      </div>

      {/* Submit centered */}
      <div className="flex justify-center mb-6">
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting || !question.trim()}
          className="px-4 py-2 rounded bg-[var(--brand)] text-white disabled:opacity-50"
        >
          {lang === "en" ? "Get answer" : "Hämta svar"}
        </button>
      </div>

      {/* NEW: Geo panel (shows only when address searched) */}
      {(address.trim() && (geo || geoLoading || geoError)) ? (
        <div className="mb-6 grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="border rounded p-3 bg-slate-50">
              <div className="text-sm text-slate-600">
                {lang === "en" ? "Electricity info" : "El-info"}
              </div>
              <GeoElectricityInfo
                address={address}
                center={geo?.center ? { lat: geo.center.lat, lon: geo.center.lon } : undefined}
              />
            </div>

            {geoError && (
              <div className="text-red-600 text-sm">{geoError}</div>
            )}

            {Array.isArray(geo?.pois) && geo!.pois!.length > 0 && (
              <div className="border rounded p-3 bg-slate-50">
                <div className="text-sm text-slate-600">
                  {lang === "en" ? "Nearby (businesses)" : "I närheten (företag)"}
                </div>
                <ul className="list-disc pl-5 text-sm">
                  {geo!.pois!.slice(0, 10).map((p, i) => {
                    const dist =
                      typeof p.distance_m === "number"
                        ? `${Math.round(p.distance_m)} m`
                        : "";
                    const rating =
                      typeof p.rating === "number" ? ` • ★ ${p.rating}` : "";
                    return (
                      <li key={i}>
                        <span className="font-medium">{p.name || "—"}</span>
                        {p.type ? <> • {p.type}</> : null}
                        {dist ? <> • {dist}</> : null}
                        {rating ? <>{rating}</> : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div>
            <div className="rounded-lg overflow-hidden border" style={{ height: 320 }}>
              {mapLoaded && center ? (
                <GoogleMap
                  center={center}
                  zoom={16}
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  options={{ streetViewControl: false, mapTypeControl: false }}
                >
                  <Marker position={center} icon={greenIcon} title={address} />
                  {hasPois &&
                    geo!.pois!.slice(0, 30).map((p, i) => (
                      <Marker
                        key={i}
                        position={{ lat: p.lat, lng: p.lon }}
                        title={p.name}
                      />
                    ))}
                </GoogleMap>
              ) : (
                <div className="h-full grid place-items-center text-slate-500 bg-slate-50">
                  {geoLoading
                    ? (lang === "en" ? "Loading map…" : "Laddar karta…")
                    : (lang === "en" ? "No map" : "Ingen karta")}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Answers */}
      {(oneLiner || why || ack || shortScript || fullScript || math || nextStep) && (
        <div className="space-y-3">
          <AnswerBlock
            title="One-liner"
            text={oneLiner}
            onCopy={() => copyText(oneLiner)}
            liked={likes.one_liner}
            onLike={() => setLikes((l) => ({ ...l, one_liner: l.one_liner === "like" ? "" : "like" }))}
            onDislike={() =>
              setLikes((l) => ({ ...l, one_liner: l.one_liner === "dislike" ? "" : "dislike" }))
            }
          />
          <AnswerBlock
            title="Varför"
            text={why}
            onCopy={() => copyText(why)}
            liked={likes.why}
            onLike={() => setLikes((l) => ({ ...l, why: l.why === "like" ? "" : "like" }))}
            onDislike={() => setLikes((l) => ({ ...l, why: l.why === "dislike" ? "" : "dislike" }))}
          />
          <AnswerBlock
            title="Bekräfta"
            text={ack}
            onCopy={() => copyText(ack)}
            liked={likes.ack}
            onLike={() => setLikes((l) => ({ ...l, ack: l.ack === "like" ? "" : "like" }))}
            onDislike={() => setLikes((l) => ({ ...l, ack: l.ack === "dislike" ? "" : "dislike" }))}
          />
          <AnswerBlock
            title="Kort manus"
            text={shortScript}
            onCopy={() => copyText(shortScript)}
            liked={likes.short_script}
            onLike={() =>
              setLikes((l) => ({ ...l, short_script: l.short_script === "like" ? "" : "like" }))
            }
            onDislike={() =>
              setLikes((l) => ({
                ...l,
                short_script: l.short_script === "dislike" ? "" : "dislike",
              }))
            }
          />
          <AnswerBlock
            title="Fullt manus"
            text={fullScript}
            onCopy={() => copyText(fullScript)}
            liked={likes.full_script}
            onLike={() =>
              setLikes((l) => ({ ...l, full_script: l.full_script === "like" ? "" : "like" }))
            }
            onDislike={() =>
              setLikes((l) => ({
                ...l,
                full_script: l.full_script === "dislike" ? "" : "dislike",
              }))
            }
          />
          <AnswerBlock
            title="Uträkning"
            text={math}
            onCopy={() => copyText(math)}
            liked={likes.math}
            onLike={() => setLikes((l) => ({ ...l, math: l.math === "like" ? "" : "like" }))}
            onDislike={() => setLikes((l) => ({ ...l, math: l.math === "dislike" ? "" : "dislike" }))}
          />
          <AnswerBlock
            title="Nästa steg"
            text={nextStep}
            onCopy={() => copyText(nextStep)}
            liked={likes.next_step}
            onLike={() =>
              setLikes((l) => ({ ...l, next_step: l.next_step === "like" ? "" : "like" }))
            }
            onDislike={() =>
              setLikes((l) => ({ ...l, next_step: l.next_step === "dislike" ? "" : "dislike" }))
            }
          />

          {/* Overall rating */}
          <div className="border rounded p-3 bg-white">
            <div className="font-medium mb-2">
              {lang === "en" ? "Rating (whole answer)" : "Betyg (hela svaret)"}
            </div>
            <StarRating value={rating} onChange={setRating} onEnter={() => {}} />
          </div>
        </div>
      )}
    </div>
  );
}
