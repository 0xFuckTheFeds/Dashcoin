import ArticleCard from '@/components/ArticleCard'
import { getAllArticles } from '@/lib/mdx'

export const metadata = {
  title: 'Articles'
}

export default function ArticlesPage() {
  const articles = getAllArticles()
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Articles</h1>
      <div className="grid gap-6">
        {articles.map(article => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  )
}
