import Link from 'next/link'
import Image from 'next/image'
import type { ArticleFrontmatter } from '@/lib/mdx'
import { formatDate } from '@/lib/utils'

export default function ArticleCard({ article }: { article: ArticleFrontmatter }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      {article.coverImage && (
        <Link href={`/articles/${article.slug}`}>
          <Image src={article.coverImage} alt="" width={800} height={400} className="w-full h-48 object-cover" />
        </Link>
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h2>
        <p className="text-sm text-muted-foreground mb-2">{formatDate(article.date)}</p>
        {article.description && <p className="mb-2">{article.description}</p>}
        <Link href={`/articles/${article.slug}`} className="text-teal-600 hover:underline">Read more →</Link>
      </div>
    </div>
  )
}
