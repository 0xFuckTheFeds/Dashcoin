import { Navbar } from '@/components/navbar'
import { FoundersEdgeChecklist } from '@/components/founders-edge-checklist'
import { fetchTokenResearch } from '@/app/actions/googlesheet-action'

export const metadata = {
  title: "Founder's Edge Checklist - Dashcoin",
}

export default async function FoundersEdgePage() {
  const data = await fetchTokenResearch()
  const token = data[0] || null

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex justify-center">
        {token ? (
          <FoundersEdgeChecklist data={token} showLegend />
        ) : (
          <p>No data found.</p>
        )}
      </main>
    </div>
  )
}
