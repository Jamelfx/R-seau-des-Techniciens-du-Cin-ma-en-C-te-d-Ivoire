import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, User, Share2, Facebook, Linkedin, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// Custom X icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const supabase = await createClient()
  
  // Fetch article by ID or slug
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .or(`id.eq.${slug},slug.eq.${slug}`)
    .eq('published', true)
    .single()
  
  if (!article) {
    notFound()
  }

  // Format date
  const formattedDate = new Date(article.published_at || article.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  // Get category label
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'actualites': 'Actualites',
      'evenements': 'Evenements',
      'formation': 'Formation',
      'conventions': 'Conventions'
    }
    return labels[category] || category
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Image */}
        {article.cover_image && (
          <div className="relative w-full h-[40vh] md:h-[50vh] bg-secondary">
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
        )}
        
        <article className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back button */}
          <Link href="/actualites" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour aux actualites
          </Link>
          
          {/* Article header */}
          <header className="mb-8">
            <Badge variant="secondary" className="mb-4">
              {getCategoryLabel(article.category)}
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight text-balance">
              {article.title}
            </h1>
            
            {article.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                {article.excerpt}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={article.published_at || article.created_at}>
                  {formattedDate}
                </time>
              </div>
              
              {article.author && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{article.author}</span>
                </div>
              )}
            </div>
          </header>
          
          {/* Share buttons */}
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-border">
            <span className="text-sm text-muted-foreground">Partager :</span>
            <Button variant="outline" size="icon" asChild>
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a 
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <XIcon className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </Button>
          </div>
          
          {/* Article content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {article.content.split('\n').map((paragraph: string, index: number) => (
              paragraph.trim() && (
                <p key={index} className="text-foreground leading-relaxed mb-4">
                  {paragraph}
                </p>
              )
            ))}
          </div>
          
          {/* Source */}
          {article.source && (
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                <strong>Source :</strong> {article.source}
                {article.source_url && (
                  <a 
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <LinkIcon className="h-3 w-3" />
                    Voir la source
                  </a>
                )}
              </p>
            </div>
          )}
          
          {/* Back to news */}
          <div className="mt-12 pt-8 border-t border-border">
            <Link href="/actualites">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voir toutes les actualites
              </Button>
            </Link>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  )
}
