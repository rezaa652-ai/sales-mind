export default function Events() {
  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-2">Events</h1>
      <p className="text-slate-600 mb-6">
        Logg över Q&amp;A (ts, question, profile, rating, used, tags). Här kan du senare lägga filter och inline-edit för feedback.
      </p>

      <div className="flex gap-2 mb-3">
        <input className="border rounded-lg p-2" placeholder="Sök fråga…" />
        <input className="border rounded-lg p-2" placeholder="Profil…" />
        <select className="border rounded-lg p-2">
          <option>Alla betyg</option>
          <option>≥ 4</option>
          <option>3</option>
          <option>≤ 2</option>
        </select>
        <button className="px-4 py-2 rounded-lg bg-[var(--brand,#2563eb)] text-white">Filtrera</button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">Tid</th>
              <th className="p-3 text-left">Fråga</th>
              <th className="p-3 text-left">Profil</th>
              <th className="p-3 text-left">Rating</th>
              <th className="p-3 text-left">Used</th>
              <th className="p-3 text-left">Tags</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="p-4 text-slate-500" colSpan={6}>Inga events ännu.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
