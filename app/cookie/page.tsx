import { Navbar } from '@/components/navbar'
import { CookieTable } from '@/components/cookie-table'

export default function CookiePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <CookieTable />
      </main>
    </div>
  )
}

