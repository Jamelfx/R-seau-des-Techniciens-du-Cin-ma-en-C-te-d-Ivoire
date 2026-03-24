import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { TalentCard } from "@/components/talent-card"

const talents = [
  {
    name: "Marc Zadi",
    role: "Directeur de la Photographie",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    status: "disponible" as const,
  },
  {
    name: "Aïcha Touré",
    role: "Chef Monteuse",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    status: "en-tournage" as const,
  },
  {
    name: "Eric Kouassi",
    role: "Ingénieur du Son",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    status: "disponible" as const,
  },
  {
    name: "Fatou Diallo",
    role: "Directrice Artistique",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    status: "indisponible" as const,
  },
]

export function FeaturedTalents() {
  return (
    <section className="border-t border-border bg-card/50 px-4 py-16">
      <div className="container mx-auto">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Talents à la Une</h2>
            <p className="mt-1 text-muted-foreground">
              Techniciens certifiés et leurs disponibilités en temps réel.
            </p>
          </div>
          <Link
            href="/annuaire"
            className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
          >
            Voir tout l{"'"}annuaire
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {talents.map((talent) => (
            <TalentCard key={talent.name} {...talent} />
          ))}
        </div>

        <Link
          href="/annuaire"
          className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline sm:hidden"
        >
          Voir tout l{"'"}annuaire
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
