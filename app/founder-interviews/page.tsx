import { Navbar } from '@/components/navbar'
import InterviewCard from '@/components/interview-card'
import { interviews } from '@/data/interviews'

export const metadata = {
  title: 'Founder Interviews - Dashcoin',
}

export default function FounderInterviewsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="relative w-full h-64 flex items-center justify-center overflow-hidden bg-gradient-to-r from-dashGreen-dark via-dashGreen to-dashGreen-light">
        <div className="absolute inset-0 opacity-20 animate-pulse bg-[url('/api/placeholder/800/200')] bg-repeat" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl font-bold mb-2">Founder Interviews</h1>
          <p className="text-lg opacity-90">Conversations with the builders shaping the Internet Capital Markets</p>
        </div>
      </section>
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {interviews.map((iv) => (
            <InterviewCard key={iv.id} interview={iv} />
          ))}
        </div>
      </main>
    </div>
  )
}
