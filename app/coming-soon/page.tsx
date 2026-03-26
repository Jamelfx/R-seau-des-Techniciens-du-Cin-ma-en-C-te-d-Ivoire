"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Facebook, Instagram, Linkedin } from "lucide-react"

// Custom X icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface SocialLink {
  platform: string
  url: string
}

export default function ComingSoonPage() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [content, setContent] = useState({
    title: 'Bientot disponible',
    text: 'Notre site est en cours de preparation. Revenez bientot!',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&h=1080&fit=crop',
    launchDate: ''
  })
  const [branding, setBranding] = useState({ logo_url: '', logo_text: 'RETECHCI' })
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])

  useEffect(() => {
    const fetchContent = async () => {
      const supabase = createClient()
      
      // Fetch settings
      const { data: settingsData } = await supabase
        .from('site_content')
        .select('key, value')
        .eq('section', 'settings')
      
      // Fetch branding
      const { data: brandingData } = await supabase
        .from('site_content')
        .select('key, value')
        .eq('section', 'branding')
      
      // Fetch social links
      const { data: socials } = await supabase
        .from('social_links')
        .select('platform, url')
        .eq('active', true)
        .order('order_index')
      
      if (settingsData) {
        const settings: Record<string, string> = {}
        settingsData.forEach(item => {
          settings[item.key] = item.value
        })
        setContent({
          title: settings.coming_soon_title || 'Bientot disponible',
          text: settings.coming_soon_text || 'Notre site est en cours de preparation. Revenez bientot!',
          image: settings.coming_soon_image || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&h=1080&fit=crop',
          launchDate: settings.launch_date || ''
        })
      }
      
      if (brandingData) {
        const brand: Record<string, string> = {}
        brandingData.forEach(item => {
          brand[item.key] = item.value
        })
        setBranding({
          logo_url: brand.logo_url || '',
          logo_text: brand.logo_text || 'RETECHCI'
        })
      }
      
      if (socials) {
        setSocialLinks(socials)
      }
    }
    
    fetchContent()
  }, [])

  useEffect(() => {
    if (!content.launchDate) return
    
    const calculateTimeLeft = () => {
      const launchDate = new Date(content.launchDate).getTime()
      const now = new Date().getTime()
      const difference = launchDate - now
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        })
      }
    }
    
    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    
    return () => clearInterval(timer)
  }, [content.launchDate])

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className="w-5 h-5" />
      case 'x': case 'twitter': return <XIcon className="w-5 h-5" />
      case 'instagram': return <Instagram className="w-5 h-5" />
      case 'linkedin': return <Linkedin className="w-5 h-5" />
      default: return null
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={content.image}
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {branding.logo_url && branding.logo_url !== '/logo-retechci.png' ? (
            <Image
              src={branding.logo_url}
              alt={branding.logo_text}
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
          ) : (
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">R</span>
            </div>
          )}
          <span className="text-2xl font-bold text-white">{branding.logo_text}</span>
        </div>
        
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          {content.title}
        </h1>
        
        {/* Description */}
        <p className="text-xl text-gray-300 mb-12 max-w-xl mx-auto">
          {content.text}
        </p>
        
        {/* Countdown */}
        {content.launchDate && (
          <div className="grid grid-cols-4 gap-4 mb-12 max-w-md mx-auto">
            {[
              { value: timeLeft.days, label: 'Jours' },
              { value: timeLeft.hours, label: 'Heures' },
              { value: timeLeft.minutes, label: 'Minutes' },
              { value: timeLeft.seconds, label: 'Secondes' }
            ].map((item, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {String(item.value).padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Social Links */}
        <div className="flex items-center justify-center gap-4">
          {socialLinks.map((social) => (
            <Link
              key={social.platform}
              href={social.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              {getSocialIcon(social.platform)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
