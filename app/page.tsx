import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { FeaturedTalents } from "@/components/featured-talents"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <FeaturedTalents />
      </main>
    </div>
  )
}
