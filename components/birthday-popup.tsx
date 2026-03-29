"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Gift, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface BirthdayMember {
  id: string
  name: string
  profession: string
  photo: string
}

export function BirthdayPopup() {
  const [currentMember, setCurrentMember] = useState<BirthdayMember | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [birthdayMembers, setBirthdayMembers] = useState<BirthdayMember[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Vérifier si déjà fermé aujourd'hui
    const dismissedToday = sessionStorage.getItem('birthdayDismissed')
    const today = new Date().toDateString()
    if (dismissedToday === today) {
      setDismissed(true)
      return
    }

    const fetchBirthdayMembers = async () => {
      const supabase = createClient()
      const today = new Date()
      const todayMonth = today.getMonth() + 1
      const todayDay = today.getDate()

      // Récupérer les membres dont c'est l'anniversaire aujourd'hui
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, profession, profile_photo, birth_date')
        .eq('status', 'active')
        .not('birth_date', 'is', null)

      if (error || !data || data.length === 0) return

      // Filtrer ceux dont l'anniversaire est aujourd'hui
      const todayBirthdays = data.filter(member => {
        if (!member.birth_date) return false
        const [, month, day] = member.birth_date.split('-').map(Number)
        return month === todayMonth && day === todayDay
      }).map(member => ({
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        profession: member.profession || 'Technicien',
        photo: member.profile_photo || '',
      }))

      if (todayBirthdays.length === 0) return

      setBirthdayMembers(todayBirthdays)

      // Afficher le popup après 2 secondes
      setTimeout(() => {
        setCurrentMember(todayBirthdays[0])
        setIsVisible(true)
      }, 2000)
    }

    fetchBirthdayMembers()
  }, [])

  useEffect(() => {
    if (!isVisible || !currentMember || dismissed) return

    // Fermer automatiquement après 20 secondes
    const hideTimeout = setTimeout(() => {
      setIsFadingOut(true)
      setTimeout(() => {
        setIsVisible(false)
        setIsFadingOut(false)

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

  // Ne rien afficher s'il n'y a pas de vrais anniversaires aujourd'hui
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
        {/* Bouton fermer */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-12 right-0 text-white hover:bg-white/20 z-10"
          onClick={handleDismiss}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Carte d'anniversaire */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-primary/20 via-background to-background border border-primary/30 shadow-2xl shadow-primary/20">
          {/* Confettis */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-pulse"
                style={{
                  left: `${(i * 17 + 5) % 100}%`,
                  top: `${(i * 13 + 3) % 40}%`,
                  backgroundColor: ['#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#a855f7'][i % 5],
                  animationDelay: `${(i * 0.1) % 2}s`,
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

          {/* Photo */}
          <div className="relative mx-auto w-48 h-64 mb-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/30 to-primary/10 blur-xl" />
            <div className="relative w-full h-full rounded-2xl overflow-hidden border-4 border-primary/50 shadow-lg bg-secondary">
              {currentMember.photo ? (
                <Image
                  src={currentMember.photo}
                  alt={currentMember.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                  {currentMember.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
            </div>
            <div className="absolute -inset-2 rounded-3xl border-2 border-primary/20 animate-pulse" />
          </div>

          {/* Infos */}
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

            {/* Indicateur si plusieurs anniversaires */}
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

          <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      </div>
    </div>
  )
}
