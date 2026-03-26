import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { FeaturedTalents } from "@/components/featured-talents"
import { DigitalCard } from "@/components/digital-card"
import { SitechSection } from "@/components/sitech-section"
import { Partners } from "@/components/partners"
import { Footer } from "@/components/footer"
import { BirthdayPopup } from "@/components/birthday-popup"
import { getMultipleSections } from "@/lib/content"

export default async function Home() {
  // Fetch content from Supabase for Hero and SITECH sections
  const sections = await getMultipleSections(['hero', 'sitech', 'featured'])
  
  return (
    <div className="min-h-screen bg-background">
      <BirthdayPopup />
      <Header />
      <main>
        <Hero content={sections.hero} />
        <FeaturedTalents content={sections.featured} />
        <DigitalCard />
        <SitechSection content={sections.sitech} />
        <Partners />
      </main>
      <Footer />
    </div>
  )
}
