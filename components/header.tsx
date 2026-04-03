"use client"

import Link from "next/link"
import Image from "next/image"
import { User, Menu, X, LogIn, UserPlus, LogOut, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useI18n } from "@/lib/i18n"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MemberInfo {
  name: string
  photo: string | null
  id: string
  role: string
}

interface BrandingContent {
  logo_url?: string
  logo_text?: string
}

export function Header() {
  const { t } = useI18n()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [member, setMember] = useState<MemberInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [branding, setBranding] = useState<BrandingContent>({})

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()

      const { data: brandingData } = await supabase
        .from('site_content')
        .select('key, value')
        .eq('section', 'branding')

      if (brandingData) {
        const brand: BrandingContent = {}
        brandingData.forEach(item => {
          brand[item.key as keyof BrandingContent] = item.value
        })
        setBranding(brand)
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: memberData } = await supabase
          .from('members')
          .select('first_name, last_name, profile_photo, member_id, role')
          .eq('email', user.email)
          .single()

        if (memberData) {
          setMember({
            name: `${memberData.first_name} ${memberData.last_name}`,
            photo: memberData.profile_photo,
            id: memberData.member_id || 'N/A',
            role: memberData.role
          })
          setIsLoggedIn(true)
        }
      }
      setIsLoading(false)
    }

    checkAuth()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false)
        setMember(null)
      } else if (event === 'SIGNED_IN') {
        checkAuth()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setMember(null)
    router.push('/')
  }

  const navigation = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.about"), href: "/a-propos" },
    { name: t("nav.directory"), href: "/annuaire" },
    { name: "A l'Affiche", href: "/a-laffiche", isHighlight: true },
    { name: t("nav.news"), href: "/actualites" },
    { name: t("nav.conventions"), href: "/conventions" },
    { name: t("nav.live"), href: "/direct", isLive: true },
    { name: t("nav.sitech"), href: "/sitech-2027" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          {branding.logo_url && branding.logo_url !== '/logo-retechci.png' ? (
            <Image
              src={branding.logo_url}
              alt={branding.logo_text || 'RETECHCI'}
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-bold">
              R
            </div>
          )}
          <span className="text-lg font-semibold text-foreground">{branding.logo_text || 'RETECHCI'}</span>
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {isLoggedIn && member ? (
                <button className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-primary hover:border-primary/80 transition-colors">
                  {member.photo ? (
                    <Image src={member.photo} alt={member.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </button>
              ) : (
                <Button variant="ghost" size="icon" className="rounded-full border border-border">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Menu utilisateur</span>
                </Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isLoggedIn && member ? (
                <>
                  <div className="px-3 py-2 border-b border-border">
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.id}</p>
                    {member.role && member.role !== 'member' && (
                      <Badge variant="outline" className="mt-1 text-xs capitalize">
                        {member.role === 'director' ? 'Directeur' :
                         member.role === 'president' ? 'President' :
                         member.role === 'treasurer' ? 'Tresoriere' :
                         member.role === 'admin' ? 'Admin CMS' : member.role}
                      </Badge>
                    )}
                  </div>
                  {member.role && ['director', 'president', 'treasurer'].includes(member.role) && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          href={member.role === 'director' ? '/directeur' :
                                member.role === 'president' ? '/admin/president' :
                                '/admin/tresorier'}
                          className="flex items-center gap-2 cursor-pointer text-primary"
                        >
                          <Shield className="h-4 w-4" />
                          Espace Administration
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/membre/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Mon Espace Membre
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Deconnexion
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
              {isLoggedIn && member ? (
                <>
                  {['director', 'president', 'treasurer'].includes(member.role) && (
                    <Link
                      href={member.role === 'director' ? '/directeur' :
                            member.role === 'president' ? '/admin/president' :
                            '/admin/tresorier'}
                      className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4" />
                      Espace Administration
                    </Link>
                  )}
                  <Link
                    href="/membre/dashboard"
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Mon Espace Membre
                  </Link>
                  <button
                    className="flex items-center gap-2 text-sm font-medium text-destructive transition-colors hover:text-destructive/80 py-2"
                    onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                  >
                    <LogOut className="h-4 w-4" />
                    Deconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link href="/connexion" className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
                    <LogIn className="h-4 w-4" />
                    Connexion
                  </Link>
                  <Link href="/adhesion" className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 py-2" onClick={() => setMobileMenuOpen(false)}>
                    <UserPlus className="h-4 w-4" />
                    Devenir Membre
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
