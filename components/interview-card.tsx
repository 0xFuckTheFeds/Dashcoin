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
    <div className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Image
        src={thumbnail}
        alt={`Thumbnail for ${interview.project}`}
        width={400}
        height={225}
        className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/40 to-transparent backdrop-blur-sm" />
      <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
        <h3 className="text-lg font-semibold drop-shadow-md">{interview.project}</h3>
        {interview.quote && (
          <p className="text-sm opacity-90 drop-shadow-sm">{interview.quote}</p>
        )}
        <Link href={`https://www.youtube.com/watch?v=${interview.youtubeId}`} target="_blank">
          <Button className="mt-2">Watch Interview</Button>
        </Link>
      </div>
    </div>
  )
}
