"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Gift, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BirthdayMember {
  id: string
  name: string
  profession: string
  photo: string
  birthDate: string
}

// Mock data - in production this would come from Supabase
const getBirthdayMembers = (): BirthdayMember[] => {
  const today = new Date()
  const todayMonth = today.getMonth() + 1
  const todayDay = today.getDate()
  
  // Sample members with birthdays - checking if today matches their birthday
  const allMembers: BirthdayMember[] = [
    {
      id: "1",
      name: "Jamel Basiru",
      profession: "Monteur Image",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
      birthDate: `1985-${String(todayMonth).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}` // Today for demo
    },
    {
      id: "2",
      name: "Aminata Koné",
      profession: "Directrice de Production",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop",
      birthDate: `1990-${String(todayMonth).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}` // Today for demo
    }
  ]
  
  // Filter members whose birthday is today
  return allMembers.filter(member => {
    const [, month, day] = member.birthDate.split('-').map(Number)
    return month === todayMonth && day === todayDay
  })
}

export function BirthdayPopup() {
  const [currentMember, setCurrentMember] = useState<BirthdayMember | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [birthdayMembers, setBirthdayMembers] = useState<BirthdayMember[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user already dismissed today
    const dismissedToday = sessionStorage.getItem('birthdayDismissed')
    const today = new Date().toDateString()
    
    if (dismissedToday === today) {
      setDismissed(true)
      return
    }
    
    const members = getBirthdayMembers()
    setBirthdayMembers(members)
    
    if (members.length > 0) {
      // Show first birthday after 2 seconds
      const showTimeout = setTimeout(() => {
        setCurrentMember(members[0])
        setIsVisible(true)
      }, 2000)
      
      return () => clearTimeout(showTimeout)
    }
  }, [])

  useEffect(() => {
    if (!isVisible || !currentMember || dismissed) return
    
    // Auto-hide after 20 seconds with fade animation
    const hideTimeout = setTimeout(() => {
      setIsFadingOut(true)
      
      // Wait for fade animation then hide or show next
      setTimeout(() => {
        setIsVisible(false)
        setIsFadingOut(false)
        
        // Show next birthday member if any
        const nextIndex = currentIndex + 1
        if (nextIndex < birthdayMembers.length) {
          setTimeout(() => {
            setCurrentIndex(nextIndex)
            setCurrentMember(birthdayMembers[nextIndex])
            setIsVisible(true)
          }, 1000)
        }
      }, 1000)
    }, 20000)
    
    return () => clearTimeout(hideTimeout)
  }, [isVisible, currentMember, currentIndex, birthdayMembers, dismissed])

  const handleDismiss = () => {
    setIsFadingOut(true)
    sessionStorage.setItem('birthdayDismissed', new Date().toDateString())
    
    setTimeout(() => {
      setIsVisible(false)
      setDismissed(true)
    }, 500)
  }

  if (!isVisible || !currentMember || dismissed) return null

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-1000 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div 
        className={`relative max-w-sm w-full mx-4 transition-all duration-1000 ${
          isFadingOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-12 right-0 text-white hover:bg-white/20 z-10"
          onClick={handleDismiss}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Birthday Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-primary/20 via-background to-background border border-primary/30 shadow-2xl shadow-primary/20">
          {/* Confetti decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 40}%`,
                  backgroundColor: ['#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#a855f7'][i % 5],
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: 0.6
                }}
              />
            ))}
          </div>
          
          {/* Header */}
          <div className="relative pt-6 pb-4 px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full mb-4">
              <Gift className="h-5 w-5 text-primary animate-bounce" />
              <span className="text-sm font-medium text-primary">Joyeux Anniversaire</span>
              <Gift className="h-5 w-5 text-primary animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>

          {/* Photo - Portrait format */}
          <div className="relative mx-auto w-48 h-64 mb-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/30 to-primary/10 blur-xl" />
            <div className="relative w-full h-full rounded-2xl overflow-hidden border-4 border-primary/50 shadow-lg">
              <Image
                src={currentMember.photo}
                alt={currentMember.name}
                fill
                className="object-cover"
              />
            </div>
            {/* Decorative ring */}
            <div className="absolute -inset-2 rounded-3xl border-2 border-primary/20 animate-pulse" />
          </div>

          {/* Info */}
          <div className="text-center px-6 pb-8">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {currentMember.name}
            </h2>
            <p className="text-primary font-medium mb-4">
              {currentMember.profession}
            </p>
            <p className="text-sm text-muted-foreground">
              Toute l&apos;équipe du RETECHCI vous souhaite une excellente journée !
            </p>
            
            {/* Progress indicator if multiple birthdays */}
            {birthdayMembers.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {birthdayMembers.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-primary' : 'bg-primary/30'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bottom decoration */}
          <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      </div>
    </div>
  )
}
