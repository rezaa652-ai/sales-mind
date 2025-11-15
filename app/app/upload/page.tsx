'use client'
import UploadForm from './components/UploadForm'
import CallList from './components/CallList'
import PersonasPanel from './components/PersonasPanel'

export default function UploadPage() {
  return (
    <main className="p-6 space-y-10 bg-white text-black">
      {/* Upload Section */}
      <section>
        <UploadForm />
      </section>

      {/* Uploaded Calls List */}
      <section>
        <h2 className="text-xl font-semibold text-blue-700 mb-3">Uploaded Calls</h2>
        <CallList />
      </section>

      {/* Personas Section */}
      <section>
        <PersonasPanel />
      </section>
    </main>
  )
}
