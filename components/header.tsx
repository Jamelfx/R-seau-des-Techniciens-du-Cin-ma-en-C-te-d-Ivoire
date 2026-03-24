"use client"

import Link from "next/link"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Accueil", href: "/" },
  { name: "A propos", href: "/a-propos" },
  { name: "Annuaire", href: "/annuaire" },
  { name: "Actualités", href: "/actualites" },
  { name: "Conventions & Légal", href: "/conventions" },
  { name: "Direct", href: "/direct", isLive: true },
  { name: "SITECH 2027", href: "/sitech-2027" },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-bold">
            R
          </div>
          <span className="text-lg font-semibold text-foreground">RETECHCI</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.isLive && (
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
              {item.name}
            </Link>
          ))}
        </nav>

        <Button variant="ghost" size="icon" className="rounded-full border border-border">
          <User className="h-5 w-5" />
          <span className="sr-only">Profil utilisateur</span>
        </Button>
      </div>
    </header>
  )
}
