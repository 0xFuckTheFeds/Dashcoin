import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Interview } from '@/data/interviews'

interface InterviewCardProps {
  interview: Interview
}

export default function InterviewCard({ interview }: InterviewCardProps) {
  const thumbnail = `https://img.youtube.com/vi/${interview.youtubeId}/hqdefault.jpg`
  return (
    <div className="group rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20">
      <Image
        src={thumbnail}
        alt={`Thumbnail for ${interview.project}`}
        width={400}
        height={225}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-white">{interview.project}</h3>
        <p className="text-sm text-slate-400 mt-1">
          {new Date(interview.publishDate).toLocaleDateString()} • {interview.views.toLocaleString()} views
        </p>
        <Link
          href={`https://www.youtube.com/watch?v=${interview.youtubeId}`}
          target="_blank"
        >
          <Button className="mt-2">Watch Interview</Button>
        </Link>
      </div>
    </div>
  )
}
