import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { FeaturedTalents } from "@/components/featured-talents"
import { DigitalCard } from "@/components/digital-card"
import { SitechSection } from "@/components/sitech-section"
import { Partners } from "@/components/partners"
import { Footer } from "@/components/footer"
import { BirthdayPopup } from "@/components/birthday-popup"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <BirthdayPopup />
      <Header />
      <main>
        <Hero />
        <FeaturedTalents />
        <DigitalCard />
        <SitechSection />
        <Partners />
      </main>
      <Footer />
    </div>
  )
}
