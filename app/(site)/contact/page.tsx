export const dynamic = 'force-dynamic'

export default function ContactPage(){
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-16 space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold">Contact</h1>
      <p className="text-slate-700">
        Email us at <a href="mailto:hello@salesmind.app" className="underline">hello@salesmind.app</a>.
      </p>

      <form
        action="https://formsubmit.co/hello@salesmind.app"
        method="POST"
        className="grid gap-3"
      >
        <input type="hidden" name="_subject" value="SalesMind website contact" />
        <input type="hidden" name="_captcha" value="false" />
        <label className="block">
          <span className="text-sm">Your name</span>
          <input name="name" required className="mt-1 w-full border rounded px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">Email</span>
          <input type="email" name="email" required className="mt-1 w-full border rounded px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">Message</span>
          <textarea name="message" rows={5} required className="mt-1 w-full border rounded px-3 py-2" />
        </label>
        <button className="px-4 py-2 rounded bg-black text-white w-fit">Send</button>
      </form>
    </div>
  )
}
