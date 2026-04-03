"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Clapperboard, User, ArrowRightLeft, Shield
} from "lucide-react"

type ActiveSpace = 'member' | 'admin'
type UserRole = 'member' | 'director' | 'president' | 'treasurer' | 'admin'

interface MemberProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  role: UserRole
  profession: string
  profile_photo: string | null
}

const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string; gradient: string }> = {
  member: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    gradient: 'from-emerald-500 via-teal-500 to-green-500',
  },
  director: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-300',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
  },
  president: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-300',
    gradient: 'from-purple-500 via-violet-500 to-indigo-500',
  },
  treasurer: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-300',
    gradient: 'from-sky-500 via-blue-500 to-cyan-500',
  },
  admin: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-300',
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
  },
}

export function SpaceSwitchBar({
  activeSpace,
  onSwitch,
  canSwitch,
  member,
}: {
  activeSpace: ActiveSpace
  onSwitch: (space: ActiveSpace) => void
  canSwitch: boolean
  member: MemberProfile
}) {
  const roleConfig = ROLE_COLORS[member.role]

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className={`h-1 w-full bg-gradient-to-r ${roleConfig.gradient}`} />
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="bg-primary rounded-md p-1.5">
              <Clapperboard className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm hidden sm:inline">RETECHCI</span>
          </div>
          <Separator orientation="vertical" className="h-5" />
          <Badge
            variant="outline"
            className={`${roleConfig.bg} ${roleConfig.text} ${roleConfig.border} border px-2.5 py-0.5 text-xs font-semibold`}
          >
            {activeSpace === 'admin' ? (
              <><Shield className="h-3 w-3 mr-1" />Espace Admin</>
            ) : (
              <><User className="h-3 w-3 mr-1" />Espace Membre</>
            )}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {canSwitch && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSwitch(activeSpace === 'admin' ? 'member' : 'admin')}
              className={`text-xs gap-1.5 h-8 ${
                activeSpace === 'admin'
                  ? 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                  : 'text-amber-700 border-amber-300 hover:bg-amber-50'
              }`}
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                Passer à l&apos;espace {activeSpace === 'admin' ? 'Membre' : 'Admin'}
              </span>
              <span className="sm:hidden">
                {activeSpace === 'admin' ? 'Membre' : 'Admin'}
              </span>
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={member.profile_photo || undefined} />
              <AvatarFallback className="text-xs bg-primary text-white">
                {member.first_name[0]}{member.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden md:inline">
              {member.first_name} {member.last_name}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
