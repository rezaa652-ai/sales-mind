export default function Profiles() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Profiles</h1>
      <p className="text-slate-600 mb-6">
        Lista + CRUD för säljarprofiler (name, language, tone, callback_windows, goals, sales_targets, persona_hints, compliance, proof, company).
      </p>

      <div className="flex justify-between items-center mb-3">
        <input className="border rounded-lg p-2 w-64" placeholder="Sök profil…" />
        <button className="px-4 py-2 rounded-lg bg-[var(--brand,#2563eb)] text-white">+ New Profile</button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Language</th>
              <th className="p-3 text-left">Tone</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="p-4 text-slate-500" colSpan={5}>Inga profiler ännu.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
