"use client"

import Link from "next/link"
import { User, Menu, X, LogIn, UserPlus, LayoutDashboard, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useI18n } from "@/lib/i18n"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { t } = useI18n()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // Simulated auth state - in production, use a proper auth provider
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const navigation = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.about"), href: "/a-propos" },
    { name: t("nav.directory"), href: "/annuaire" },
    { name: t("nav.news"), href: "/actualites" },
    { name: t("nav.conventions"), href: "/conventions" },
    { name: t("nav.live"), href: "/direct", isLive: true },
    { name: t("nav.sitech"), href: "/sitech-2027" },
  ]

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
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          
          {/* User Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full border border-border">
                <User className="h-5 w-5" />
                <span className="sr-only">Menu utilisateur</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isLoggedIn ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/membre/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" />
                      Mon Espace Membre
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer text-destructive"
                    onClick={() => setIsLoggedIn(false)}
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/connexion" className="flex items-center gap-2 cursor-pointer">
                      <LogIn className="h-4 w-4" />
                      Connexion
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/adhesion" className="flex items-center gap-2 cursor-pointer">
                      <UserPlus className="h-4 w-4" />
                      Devenir Membre
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.isLive && (
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
                {item.name}
              </Link>
            ))}
            <div className="border-t border-border pt-4 mt-2 flex flex-col gap-2">
              <Link
                href="/connexion"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn className="h-4 w-4" />
                Connexion
              </Link>
              <Link
                href="/adhesion"
                className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserPlus className="h-4 w-4" />
                Devenir Membre
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
