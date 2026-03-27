"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Linkedin, MapPin, Mail, Phone, Instagram, Youtube } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

// Custom X (Twitter) icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

interface SocialLink {
  platform: string
  url: string
  icon_name: string
}

interface Partner {
  id: string
  name: string
  logo_url: string
  website_url: string
}

interface FooterContent {
  copyright?: string
  address?: string
  phone?: string
  email?: string
  description?: string
}

interface BrandingContent {
  logo_url?: string
  logo_text?: string
}

export function Footer() {
  const { t } = useI18n()
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [footerContent, setFooterContent] = useState<FooterContent>({})
  const [branding, setBranding] = useState<BrandingContent>({})

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // Fetch social links
      const { data: socials } = await supabase
        .from('social_links')
        .select('*')
        .eq('active', true)
        .order('order_index')
      
      // Fetch partners
      const { data: partnersData } = await supabase
        .from('partners')
        .select('*')
        .eq('active', true)
        .order('order_index')
      
      // Fetch footer content
      const { data: footerData } = await supabase
        .from('site_content')
        .select('key, value')
        .eq('section', 'footer')
      
      // Fetch branding
      const { data: brandingData } = await supabase
        .from('site_content')
        .select('key, value')
        .eq('section', 'branding')
      
      if (socials) setSocialLinks(socials)
      if (partnersData) setPartners(partnersData)
      if (footerData) {
        const content: FooterContent = {}
        footerData.forEach(item => {
          content[item.key as keyof FooterContent] = item.value
        })
        setFooterContent(content)
      }
      if (brandingData) {
        const brand: BrandingContent = {}
        brandingData.forEach(item => {
          brand[item.key as keyof BrandingContent] = item.value
        })
        setBranding(brand)
      }
    }
    
    fetchData()
  }, [])

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className="w-5 h-5" />
      case 'x': return <XIcon className="w-5 h-5" />
      case 'twitter': return <XIcon className="w-5 h-5" />
      case 'instagram': return <Instagram className="w-5 h-5" />
      case 'youtube': return <Youtube className="w-5 h-5" />
      case 'linkedin': return <Linkedin className="w-5 h-5" />
      default: return null
    }
  }

  return (
    <footer className="bg-card border-t border-border">
      {/* Partners Section */}
      {partners.length > 0 && (
        <div className="border-b border-border py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-center text-sm font-medium text-muted-foreground mb-6">
              Nos Partenaires Officiels
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {partners.map((partner) => (
                <Link
                  key={partner.id}
                  href={partner.website_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                >
                  {partner.logo_url ? (
                    <Image
                      src={partner.logo_url}
                      alt={partner.name}
                      width={120}
                      height={40}
                      className="h-10 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">
                      {partner.name}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Logo & Description */}
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-3">
                {branding.logo_url && branding.logo_url !== '/logo-retechci.png' ? (
                  <Image
                    src={branding.logo_url}
                    alt={branding.logo_text || 'RETECHCI'}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-xl">R</span>
                  </div>
                )}
                <span className="font-bold text-xl text-foreground">
                  {branding.logo_text || 'RETECHCI'}
                </span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {footerContent.description || t("footer.description")}
              </p>
              <div className="flex gap-4">
                {socialLinks.length > 0 ? (
                  socialLinks.map((social) => (
                    <Link
                      key={social.platform}
                      href={social.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title={social.platform}
                    >
                      {getSocialIcon(social.platform)}
                    </Link>
                  ))
                ) : (
                  <>
                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Facebook className="w-5 h-5" />
                    </Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                      <XIcon className="w-5 h-5" />
                    </Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Instagram className="w-5 h-5" />
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            {/* Navigation */}
            <div>
              <h3 className="font-semibold text-foreground mb-6">{t("footer.navigation")}</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {t("nav.home")}
                  </Link>
                </li>
                <li>
                  <Link href="/a-propos" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {t("nav.about")}
                  </Link>
                </li>
                <li>
                  <Link href="/annuaire" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {t("footer.talentsDirectory")}
                  </Link>
                </li>
                <li>
                  <Link href="/actualites" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {t("nav.news")}
                  </Link>
                </li>
                <li>
                  <Link href="/sitech-2027" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {t("nav.sitech")}
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Ressources */}
            <div>
              <h3 className="font-semibold text-foreground mb-6">{t("footer.resources")}</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/conventions" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {t("footer.salaryGrid")}
                  </Link>
                </li>
                <li>
                  <Link href="/conventions" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {t("footer.contracts")}
                  </Link>
                </li>
                <li>
                  <Link href="/conventions" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {t("nav.conventions")}
                  </Link>
                </li>
                <li>
                  <Link href="/adhesion" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Devenir Membre
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h3 className="font-semibold text-foreground mb-6">{t("footer.contact")}</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">
                    {footerContent.address || t("footer.address")}
                  </span>
                </li>
                {footerContent.phone && (
                  <li className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary shrink-0" />
                    <Link href={`tel:${footerContent.phone}`} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                      {footerContent.phone}
                    </Link>
                  </li>
                )}
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <Link 
                    href={`mailto:${footerContent.email || 'contact@retechci.org'}`} 
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {footerContent.email || 'contact@retechci.org'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-center text-muted-foreground text-sm">
              © {new Date().getFullYear()} {branding.logo_text || 'RETECHCI'}. {footerContent.copyright || t("footer.rights")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
