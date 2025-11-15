import HIcon from '@/components/HIcon'
import { DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
      <h1 className="text-3xl md:text-5xl font-bold mb-6">
        <HIcon><DollarSign className="h-8 w-8 text-black" /></HIcon>
        Pricing
      </h1>

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
            <tr className="border-t">
              <td className="p-3 font-medium">Solo</td>
              <td className="p-3">1 rep, unlimited Q&A, personal insights</td>
              <td className="p-3">399 SEK / month</td>
            </tr>
            <tr className="border-t">
              <td className="p-3 font-medium">Team</td>
              <td className="p-3">10+ reps, shared knowledge base, analytics</td>
              <td className="p-3">from 2,990 SEK / month</td>
            </tr>
            <tr className="border-t">
              <td className="p-3 font-medium">Enterprise</td>
              <td className="p-3">Custom setup, integrations, dedicated support</td>
              <td className="p-3">Contact us</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-slate-700 mt-6">
        Prices shown exclude VAT. Need a custom plan? <a href="/contact" className="underline">Get in touch</a>.
      </p>
    </div>
  )
}
