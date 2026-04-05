export default async function Home() {
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
