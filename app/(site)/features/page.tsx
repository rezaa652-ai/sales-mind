import SiteImage from '@/components/SiteImage'
import HIcon from '@/components/HIcon'
import { Rocket, BrainCircuit, Mic2, Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function FeaturesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 space-y-10">
      <header className="space-y-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold">
          <HIcon><Rocket className="h-8 w-8 text-black" /></HIcon>
          Key Features
        </h1>
        <p className="text-lg text-slate-700 max-w-2xl mx-auto">
          SalesMind gives every sales rep the confidence, tools, and insights to win more calls — all powered by AI.
        </p>
      </header>

      <section className="space-y-10">
        {/* Personal Data Insights (image right) */}
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl font-semibold">
              <HIcon><BrainCircuit className="h-6 w-6 text-black" /></HIcon>
              Personal Data Insights
            </h2>
            <p className="text-slate-700">
              Instantly surface public information about prospects — like interests, company background, or tone hints — so you can build trust and relatability from the very first seconds of a call.
            </p>
          </div>
          <div className="md:w-1/2">
            <SiteImage src="sections/three-icons.jpg" alt="Three feature icons layout" />
          </div>
        </div>

        {/* Simulation Training (image left) */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-10">
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl font-semibold">
              <HIcon><Mic2 className="h-6 w-6 text-black" /></HIcon>
              Simulation Training
            </h2>
            <p className="text-slate-700">
              Practice live conversations with an AI-driven customer that reacts like a real person. Build confidence, sharpen objection handling, and train naturally — anytime, anywhere.
            </p>
          </div>
          <div className="md:w-1/2">
            <SiteImage src="sections/three-icons.jpg" alt="Three feature icons layout" />
          </div>
        </div>

        {/* AI Coaching Q&A (image right) */}
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl font-semibold">
              <HIcon><Zap className="h-6 w-6 text-black" /></HIcon>
              AI Coaching Q&A
            </h2>
            <p className="text-slate-700">
              Get instant answers to any customer objection. Ask “What do I say if they say it’s too expensive?” and receive clear, personalized responses in your tone — ready to use right away.
            </p>
          </div>
          <div className="md:w-1/2">
            <SiteImage src="sections/three-icons.jpg" alt="Three feature icons layout" />
          </div>
        </div>
      </section>
    </div>
  )
}

