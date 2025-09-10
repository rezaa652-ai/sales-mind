export default function KB() {
  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-2">Knowledge Base</h1>
      <p className="text-slate-600 mb-6">
        Lista + CRUD för KBEntry (signal, best_practice, profile_name). Används som “best practice” i Q&amp;A (RAG-light).
      </p>

      <div className="flex justify-between items-center mb-3">
        <input className="border rounded-lg p-2 w-64" placeholder="Sök signal…" />
        <button className="px-4 py-2 rounded-lg bg-[var(--brand,#2563eb)] text-white">+ New Entry</button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">Signal</th>
              <th className="p-3 text-left">Best practice</th>
              <th className="p-3 text-left">Profile</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="p-4 text-slate-500" colSpan={4}>Inga KB entries ännu.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
