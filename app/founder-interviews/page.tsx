import { Navbar } from '@/components/navbar'
import InterviewCard from '@/components/interview-card'
import { interviews } from '@/data/interviews'
import { 
  MessageCircle, 
  Users, 
  Mic, 
  Play, 
  Calendar,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Building,
  Globe,
  Search,
  Filter,
  Clock,
  Star
} from "lucide-react";

export const metadata = {
  title: 'Founder Interviews - Dashcoin',
}

export default function FounderInterviewsPage() {
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
      <section className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            {/* Floating badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 via-teal-500/10 to-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium mb-8 backdrop-blur-xl">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <Mic className="w-4 h-4" />
              <span>Exclusive Conversations</span>
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-500"></div>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-teal-100 to-green-200 bg-clip-text text-transparent mb-8 tracking-tight leading-tight">
              Founder Interviews
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-12 font-light">
              Conversations with the{" "}
              <span className="text-transparent bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text font-semibold">
                visionary builders
              </span>
              {" "}shaping the Internet Capital Markets. Deep insights into strategy, innovation, and the future of decentralized finance.
            </p>

            {/* Enhanced search and filter section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search interviews by founder or topic..."
                  className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:bg-white/[0.08] focus:border-white/20 transition-all duration-200 backdrop-blur-xl"
                />
              </div>
              <button className="flex items-center gap-2 px-6 py-4 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white rounded-2xl transition-all duration-200 backdrop-blur-xl font-medium">
                <Filter className="w-5 h-5" />
                <span>Filter</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Enhanced Main Content */}
      <main className="relative z-10 container mx-auto px-6 pb-16 max-w-7xl">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 via-green-600 to-teal-600 rounded-2xl shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Latest Interviews</h2>
              <p className="text-slate-400">In-depth conversations with industry leaders</p>
            </div>
          </div>
          
          {/* Sort/Filter controls */}
          <div className="hidden md:flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors">
              <Star className="w-4 h-4" />
              <span className="text-sm">Featured</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Recent</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Popular</span>
            </button>
          </div>
        </div>

        {/* Enhanced Interview Grid */}
        {interviews && interviews.length > 0 ? (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {interviews.map((interview, index) => (
              <div key={interview.id} className="group relative">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-teal-500/10 to-green-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl transform group-hover:scale-110"></div>
                
                {/* Enhanced Interview Card Container */}
                <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden hover:bg-white/[0.04] hover:border-white/15 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-green-500/10">
                  <InterviewCard interview={interview} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mic className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No interviews available</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">We're working on bringing you exclusive conversations with top founders. Check back soon for new content.</p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105">
              <Globe className="w-4 h-4" />
              Follow for Updates
            </button>
          </div>
        )}

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
                <button className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 via-green-700 to-teal-600 hover:from-green-500 hover:via-green-600 hover:to-teal-500 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl">
                  <MessageCircle className="w-5 h-5" />
                  <span>Request Interview</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
                
                <button className="group flex items-center gap-3 px-8 py-4 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white font-semibold rounded-2xl transition-all duration-300 backdrop-blur-xl">
                  <Users className="w-5 h-5" />
                  <span>Join Community</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}