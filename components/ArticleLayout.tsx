import { MDXRemote } from 'next-mdx-remote/rsc'
import type { ArticleFrontmatter } from '@/lib/mdx'
import { formatDate } from '@/lib/utils'

interface ArticleLayoutProps {
  frontmatter: ArticleFrontmatter
  content: string
}

export default function ArticleLayout({ frontmatter, content }: ArticleLayoutProps) {
  return (
    <article className="prose prose-slate dark:prose-invert mx-auto py-8">
      <h1 className="mb-0">{frontmatter.title}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {formatDate(frontmatter.date)}
        {frontmatter.lastUpdated && (
          <span className="ml-2">(Last updated {formatDate(frontmatter.lastUpdated)})</span>
        )}
      </p>
      <MDXRemote source={content} />
    </article>
  )
}
