export default function QA() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Q&amp;A</h1>
      <p className="text-slate-600 mb-6">
        Här kommer formuläret (Company, Profile, Question, Goal/Segment/Channel/Numbers) och svarskortet.
      </p>

      <div className="space-y-3">
        <label className="block">
          <span className="text-sm text-slate-700">Fråga / Signal</span>
          <textarea className="mt-1 w-full border rounded-lg p-3" rows={4} placeholder="Skriv din fråga här…" />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-slate-700">Company (valfritt)</span>
            <input className="mt-1 w-full border rounded-lg p-2" placeholder="Välj bolag…" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">Profile (krävs)</span>
            <input className="mt-1 w-full border rounded-lg p-2" placeholder="Välj profil…" />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded-lg p-2" placeholder="Goal" />
          <input className="border rounded-lg p-2" placeholder="Segment" />
          <input className="border rounded-lg p-2" placeholder="Channel" />
        </div>

        <input className="border rounded-lg p-2 w-full" placeholder="Numbers (valfritt)" />

        <button className="mt-3 px-4 py-2 rounded-lg bg-[var(--brand,#2563eb)] text-white">
          Get answer
        </button>
      </div>

      <div className="mt-8 border rounded-xl p-4">
        <p className="text-sm text-slate-500">Svarskort kommer att visas här (one_liner, why, ack, short/full script, math, next_step).</p>
      </div>
    </div>
  )
}
