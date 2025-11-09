// app/(site)/page.tsx
import Link from 'next/link'
import SiteImage from '@/components/SiteImage'
import HIcon from '@/components/HIcon'
import {
  BrainCircuit,
  Target,
  Cog,
  Lightbulb,
  Zap,
  DollarSign,
  BarChart3,
  Globe,
  CheckCircle2,
  Clock,
  Briefcase,
  GraduationCap,
  Mic2
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Text */}
            <div className="md:w-1/2 space-y-4 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold">
                <HIcon><BrainCircuit className="h-16 w-16 text-black" /></HIcon>
                SalesMind – AI Sales Coach for Real-Time Objection Handling
              </h1>
              <h3 className="text-xl md:text-2xl text-slate-800">
                Turn every sales call into a sale.
              </h3>

              {/* Mobile-only image (between subtitle and paragraph) */}
              <div className="block md:hidden mb-4">
                <SiteImage
                  src="hero.jpg"
                  alt="Sales rep using AI assistant during call"
                  priority
                />
              </div>

              <p className="text-lg text-slate-700">
                SalesMind helps sales reps handle objections in real time and build trust with prospects using conversational AI and personal data insights — boosting confidence, connection, and closing rates.
              </p>

              <div className="flex gap-3 justify-center md:justify-start">
                <Link href="/auth" className="px-4 py-2 rounded border">Log In</Link>
                <Link href="/auth" className="px-4 py-2 rounded bg-black text-white">Sign Up</Link>
              </div>
            </div>

            {/* Desktop-only image */}
            <div className="hidden md:block md:w-1/2">
              <SiteImage
                src="hero.jpg"
                alt="Sales rep using AI assistant during call"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Built for Sales Reps */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2 space-y-4">
              <h2 className="text-2xl md:text-3xl font-semibold">
                <HIcon><Target className="h-6 w-6 text-black" /></HIcon>
                Built for Sales Reps Who Want to Win Every Call
              </h2>
              <p className="text-slate-700">
                <strong>Tired of freezing mid-call?</strong> SalesMind gives you the right words and insights exactly when you need them — so you can handle any objection confidently.
              </p>
              <ul className="list-none space-y-2 text-slate-700">
                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 mt-0.5 mr-2 text-black" /> <span>Personal intel to build trust and relatability</span></li>
                <li className="flex items-start"><Zap className="h-5 w-5 mt-0.5 mr-2 text-black" /> <span>Live AI feedback on tone and phrasing</span></li>
                <li className="flex items-start"><BrainCircuit className="h-5 w-5 mt-0.5 mr-2 text-black" /> <span>Continuous learning from your real calls</span></li>
              </ul>
              <blockquote className="p-4 bg-slate-50 rounded">
                “It’s like having a coach next to you during every customer call.”<br/>— Sales Rep, Telecom Sector
              </blockquote>
            </div>
            <div className="md:w-1/2">
              <SiteImage
                src="sections/coaching.jpg"
                alt="Sales team collaboration or coaching scene"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row-reverse items-center gap-10">
            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6">
                <HIcon><Cog className="h-6 w-6 text-black" /></HIcon>
                How It Works
              </h2>
              <ol className="space-y-2 text-slate-700">
                <li>1. <strong>Sign up</strong> – self-serve or via your sales manager</li>
                <li>2. <strong>Ask for help mid-call</strong> – get tailored objection scripts and customer insights instantly</li>
                <li>3. <strong>Review and learn</strong> – your calls become personalized lessons with AI simulations</li>
              </ol>
            </div>
            <div className="md:w-1/2">
              <SiteImage
                src="sections/flow.jpg"
                alt="Step-by-step flow graphic"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why 10× Better */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6">
                <HIcon><Lightbulb className="h-6 w-6 text-black" /></HIcon>
                Why SalesMind Is 10× Better
              </h2>
              <div className="overflow-x-auto border rounded">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3">Today’s Way</th>
                      <th className="p-3">With SalesMind</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t"><td className="p-3">Managers spend hours repeating the same coaching</td><td className="p-3">AI simulations train reps automatically</td></tr>
                    <tr className="border-t"><td className="p-3">Scattered tools for research, notes, and training</td><td className="p-3">One unified platform</td></tr>
                    <tr className="border-t"><td className="p-3">Guesswork in customer connection</td><td className="p-3">Personal data insights build rapport instantly</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="md:w-1/2">
              <SiteImage
                src="sections/comparison.jpg"
                alt="Comparison chart graphic"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features (icons added) */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row-reverse items-center gap-10">
            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6">
                <HIcon><Zap className="h-6 w-6 text-black" /></HIcon>
                Key Features
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 rounded border">
                  <h3 className="font-medium mb-2">
                    <HIcon><BrainCircuit className="h-5 w-5 text-black" /></HIcon>
                    Personal Data Insights
                  </h3>
                  <p className="text-slate-700">
                    Instantly surface public information about prospects — like interests, company background, or tone hints — so you can build trust and relatability from the very first seconds of a call.
                  </p>
                </div>
                <div className="p-4 rounded border">
                  <h3 className="font-medium mb-2">
                    <HIcon><Mic2 className="h-5 w-5 text-black" /></HIcon>
                    Simulation Training
                  </h3>
                  <p className="text-slate-700">
                    Practice live conversations with an AI-driven customer that reacts like a real person. Build confidence, sharpen objection handling, and train naturally — anytime, anywhere.
                  </p>
                </div>
                <div className="p-4 rounded border">
                  <h3 className="font-medium mb-2">
                    <HIcon><Zap className="h-5 w-5 text-black" /></HIcon>
                    AI Coaching Q&A
                  </h3>
                  <p className="text-slate-700">
                    Get instant answers to any customer objection. Ask “What do I say if they say it’s too expensive?” and receive clear, personalized responses in your tone — ready to use right away.
                  </p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <SiteImage
                src="sections/three-icons.jpg"
                alt="Three feature icons layout"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing (removed VAT line) */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6">
                <HIcon><DollarSign className="h-6 w-6 text-black" /></HIcon>
                Simple Pricing – Subscription per Seat
              </h2>
              <div className="overflow-x-auto border rounded">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3">Plan</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t"><td className="p-3 font-medium">Solo</td><td className="p-3">1 rep, unlimited Q&A, personal insights</td><td className="p-3">399 SEK / month</td></tr>
                    <tr className="border-t"><td className="p-3 font-medium">Team</td><td className="p-3">10+ reps, shared knowledge base, analytics</td><td className="p-3">from 2,990 SEK / month</td></tr>
                    <tr className="border-t"><td className="p-3 font-medium">Enterprise</td><td className="p-3">Custom setup, integrations, dedicated support</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="md:w-1/2">
              <SiteImage
                src="sections/pricing.jpg"
                alt="Pricing table graphic"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why It Works (icons fixed) */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row-reverse items-center gap-10">
            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6">
                <HIcon><BarChart3 className="h-6 w-6 text-black" /></HIcon>
                Why It Works
              </h2>
              <div className="overflow-x-auto border rounded">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3">Metric</th>
                      <th className="p-3">Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t"><td className="p-3"><HIcon><Clock className="h-5 w-5 text-black" /></HIcon> Time Saved</td><td className="p-3">30–60 seconds per objection</td></tr>
                    <tr className="border-t"><td className="p-3"><HIcon><Briefcase className="h-5 w-5 text-black" /></HIcon> Deal Conversion</td><td className="p-3">+15–25% more deals closed</td></tr>
                    <tr className="border-t"><td className="p-3"><HIcon><GraduationCap className="h-5 w-5 text-black" /></HIcon> Manager Efficiency</td><td className="p-3">5–8 hours saved weekly on coaching</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-slate-700 mt-4">
                Each call becomes a training moment — creating stronger, faster, and more confident sales teams.
              </p>
            </div>
            <div className="md:w-1/2">
              <SiteImage
                src="sections/chart.jpg"
                alt="Data visualization chart or graph"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6">
                <HIcon><Globe className="h-6 w-6 text-black" /></HIcon>
                About Us
              </h2>
              <p className="text-slate-700">
                SalesMind started in Sweden, built by real sales professionals who’ve lived the challenge of handling objections under pressure.
                Now expanding across the Nordics — empowering every sales rep to sell smarter, faster, and more human.
              </p>
            </div>
            <div className="md:w-1/2">
              <SiteImage
                src="sections/team.jpg"
                alt="Founders portrait or team photo"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold">
            <HIcon><CheckCircle2 className="h-6 w-6 text-black" /></HIcon>
            Start Free – See Results in Minutes
          </h2>
          <p className="text-slate-700">No credit card. Just make calls. Start selling smarter.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/auth" className="px-4 py-2 rounded bg-black text-white">Sign Up</Link>
            <Link href="/auth" className="px-4 py-2 rounded border">Log In</Link>
          </div>
        </div>
      </section>
    </>
  )
}
