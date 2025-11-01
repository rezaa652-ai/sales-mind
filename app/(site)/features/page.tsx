// app/(site)/features/page.tsx
import SiteImage from '@/components/SiteImage'

export const dynamic = 'force-dynamic'

export default function FeaturesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 space-y-10">
      <header className="space-y-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold">🚀 Key Features</h1>
        <p className="text-lg text-slate-700 max-w-2xl mx-auto">
          SalesMind gives every sales rep the confidence, tools, and insights to
          win more calls — all powered by AI.
        </p>
      </header>

      <section className="space-y-10">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">💡 Personal Data Insights</h2>
          <p className="text-slate-700">
            Instantly surface public information about prospects — like interests,
            company background, or tone hints — so you can build trust and relatability
            from the very first seconds of a call.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">🎙️ Simulation Training</h2>
          <p className="text-slate-700">
            Practice live conversations with an AI-driven customer that reacts like
            a real person. Build confidence, sharpen objection handling, and train
            naturally — anytime, anywhere.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">⚡ AI Coaching Q&A</h2>
          <p className="text-slate-700">
            Get instant answers to any customer objection. Ask “What do I say if
            they say it’s too expensive?” and receive clear, personalized responses
            in your tone — ready to use right away.
          </p>
        </div>
      </section>

      <div className="pt-6">
        <SiteImage
          src="sections/three-icons.jpg"
          alt="Three feature icons layout"
        />
      </div>
    </div>
  )
}
