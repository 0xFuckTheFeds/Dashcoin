import { Navbar } from '@/components/navbar'
import InterviewSearchGrid from '@/components/interview-search-grid'
import { interviews } from '@/data/interviews'
import { 
  MessageCircle,
  Users,
  Mic,
  ArrowRight,
  Sparkles
} from "lucide-react";

export const metadata = {
  title: 'Founder Interviews - Dashcoin',
}

export default function FounderInterviewsPage() {
  const requestInterviewLink = "https://x.com/nic_wenzel_1";
  const communityLink =
    "https://x.com/i/communities/1923256037240603012";
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.12),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(139,92,246,0.08),transparent_50%)]"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-l from-green-500/6 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-teal-500/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Mesh pattern */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        </div>
      </div>

      {/* Navigation */}
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* Enhanced Hero Section */}
      <section className="relative z-10 pt-12 pb-8">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            {/* Floating badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 via-teal-500/10 to-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium mb-8 backdrop-blur-xl">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <Mic className="w-4 h-4" />
              <span>Exclusive Conversations</span>
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-500"></div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-teal-100 to-green-200 bg-clip-text text-transparent mb-6 tracking-tight leading-tight">
              Founder Interviews
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8 font-light">
              Conversations with the{" "}
              <span className="text-transparent bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text font-semibold">
                visionary builders
              </span>
              {" "}shaping the Internet Capital Markets. Deep insights into strategy, innovation, and the future of decentralized finance.
            </p>

          </div>

        </div>
      </section>

      {/* Enhanced Main Content */}
      <main className="relative z-10 container mx-auto px-6 pb-16 max-w-7xl">
        <InterviewSearchGrid interviews={interviews} />

        {/* Enhanced Call-to-Action Section */}
        <section className="mt-20">
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 md:p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">Want to be Featured?</h3>
              </div>
              
              <p className="text-slate-300 leading-relaxed mb-8 text-lg">
                Are you building something innovative in the Internet Capital Markets space? 
                We'd love to hear your story and share it with our community.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={requestInterviewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 via-green-700 to-teal-600 hover:from-green-500 hover:via-green-600 hover:to-teal-500 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Request Interview</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </a>

                <a
                  href={communityLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-8 py-4 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white font-semibold rounded-2xl transition-all duration-300 backdrop-blur-xl"
                >
                  <Users className="w-5 h-5" />
                  <span>Join Community</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}