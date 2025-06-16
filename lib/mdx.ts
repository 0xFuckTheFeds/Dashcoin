import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

const ARTICLES_PATH = path.join(process.cwd(), 'content', 'articles')

export interface ArticleFrontmatter {
  title: string
  date: string
  slug: string
  description?: string
  tags?: string[]
  coverImage?: string
  lastUpdated?: string
}

export interface Article {
  frontmatter: ArticleFrontmatter
  content: string
}

export function getArticleSlugs() {
  return fs.readdirSync(ARTICLES_PATH).filter(file => file.endsWith('.mdx'))
}

export async function getArticleBySlug(slug: string): Promise<Article> {
  const realSlug = slug.replace(/\.mdx$/, '')
  const fullPath = path.join(ARTICLES_PATH, `${realSlug}.mdx`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
      format: 'mdx'
    }
  })
  return {
    frontmatter: data as ArticleFrontmatter,
    content: mdxSource.compiledSource
  }
}

export function getAllArticles(): ArticleFrontmatter[] {
  const slugs = getArticleSlugs()
  const articles = slugs.map(slug => {
    const file = fs.readFileSync(path.join(ARTICLES_PATH, slug), 'utf8')
    const { data } = matter(file)
    return data as ArticleFrontmatter
  })
  return articles.sort((a, b) => (a.date > b.date ? -1 : 1))
}
