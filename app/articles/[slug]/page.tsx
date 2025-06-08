import ArticleLayout from '@/components/ArticleLayout'
import { getArticleBySlug, getArticleSlugs } from '@/lib/mdx'
import { notFound } from 'next/navigation'

interface Params { params: { slug: string } }

export async function generateStaticParams() {
  return getArticleSlugs().map(slug => ({ slug: slug.replace(/\.mdx$/, '') }))
}

export default async function ArticlePage({ params }: Params) {
  try {
    const { frontmatter, content } = await getArticleBySlug(params.slug)
    return <ArticleLayout frontmatter={frontmatter} content={content} />
  } catch {
    notFound()
  }
}
