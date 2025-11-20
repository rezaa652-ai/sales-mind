'use client'
export default function AnalyticsSummary({ summary }: { summary: any }) {
  return (
    <div className="p-4 border rounded-xl bg-white mt-6">
      <h3 className="font-semibold text-lg mb-2">📊 Conversation Analytics</h3>
      <p>Empathy Score: {summary.empathyScore}/10</p>
      <p>Talk Ratio: {summary.talkRatio}%</p>
      <p>Confidence: {summary.confidence}/10</p>
    </div>
  )
}
