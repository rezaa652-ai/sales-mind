export default function Settings() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-slate-600 mb-6">
        Redigera användarprofil (name, tone, language). Plan visas read-only.
      </p>

      <div className="space-y-3">
        <label className="block">
          <span className="text-sm text-slate-700">Name</span>
          <input className="mt-1 w-full border rounded-lg p-2" placeholder="Ditt namn" />
        </label>

        <label className="block">
          <span className="text-sm text-slate-700">Tone</span>
          <input className="mt-1 w-full border rounded-lg p-2" placeholder="Ex: Konkret, respektfull, kort" />
        </label>

        <label className="block">
          <span className="text-sm text-slate-700">Language</span>
          <input className="mt-1 w-full border rounded-lg p-2" placeholder="Svenska" />
        </label>

        <div className="pt-2 text-sm text-slate-500">
          Plan: <span className="font-medium">Free</span> (read-only)
        </div>

        <button className="mt-3 px-4 py-2 rounded-lg bg-[var(--brand,#2563eb)] text-white">
          Spara
        </button>
      </div>
    </div>
  )
}
