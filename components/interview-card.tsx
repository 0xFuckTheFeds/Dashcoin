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
    <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Image
        src={thumbnail}
        alt={`Thumbnail for ${interview.project}`}
        width={400}
        height={225}
        className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2 text-white">
        <h3 className="text-xl font-semibold">{interview.project}</h3>
        {interview.quote && (
          <p className="text-sm opacity-90 group-hover:translate-y-0 translate-y-2 transition-transform duration-300">
            {interview.quote}
          </p>
        )}
        <Link href={`https://www.youtube.com/watch?v=${interview.youtubeId}`} target="_blank">
          <Button className="mt-2">Watch Interview</Button>
        </Link>
      </div>
    </div>
  )
}
