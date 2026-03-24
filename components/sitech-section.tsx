import { Button } from "@/components/ui/button"

export function SitechSection() {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-background/90" />
      
      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-2xl">
          <p className="text-primary font-semibold tracking-wide mb-4">
            L&apos;ÉVÉNEMENT DE L&apos;ANNÉE
          </p>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-foreground">SITECH </span>
            <span className="text-amber-500">2027</span>
          </h2>
          
          <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-xl">
            Salon International des Technologies de l&apos;Image et du Son. 
            Retrouvez les dernières innovations, des masterclasses 
            exclusives et tout l&apos;écosystème audiovisuel ouest-africain.
          </p>
          
          <div className="flex gap-12 mb-8">
            <div>
              <p className="text-3xl font-bold text-foreground">15-17</p>
              <p className="text-primary font-semibold text-sm">DÉCEMBRE 2027</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">1500+</p>
              <p className="text-primary font-semibold text-sm">PARTICIPANTS</p>
            </div>
          </div>
          
          <Button 
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-6 text-base"
          >
            Découvrir SITECH 2027
          </Button>
        </div>
      </div>
    </section>
  )
}
