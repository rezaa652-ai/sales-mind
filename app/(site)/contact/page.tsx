import { Mail, User, MessageSquare } from 'lucide-react'

function HIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center align-middle mr-2 text-black">
      {children}
    </span>
  )
}

export const dynamic = 'force-dynamic'

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-16 space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold flex items-center">
        <HIcon><Mail size={32} /></HIcon> Contact
      </h1>

      <p className="text-slate-700">
        Email us at{' '}
        <a href="mailto:hello@salesmind.app" className="underline">
          hello@salesmind.app
        </a>.
      </p>

      <form
        action="https://formsubmit.co/hello@salesmind.app"
        method="POST"
        className="grid gap-3"
      >
        <input type="hidden" name="_subject" value="SalesMind website contact" />
        <input type="hidden" name="_captcha" value="false" />

        <label className="block">
          <span className="text-sm flex items-center">
            <HIcon><User size={18} /></HIcon>Your name
          </span>
          <input
            name="name"
            required
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm flex items-center">
            <HIcon><Mail size={18} /></HIcon>Email
          </span>
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm flex items-center">
            <HIcon><MessageSquare size={18} /></HIcon>Message
          </span>
          <textarea
            name="message"
            rows={5}
            required
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </label>

        <button className="px-4 py-2 rounded bg-black text-white w-fit">
          Send
        </button>
      </form>
    </div>
  )
}
