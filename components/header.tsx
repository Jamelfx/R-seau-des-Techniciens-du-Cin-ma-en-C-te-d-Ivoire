'use client'

import { Film, Shield, LogOut, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeaderProps {
  space?: 'member' | 'director'
  userName?: string
  userEmail?: string
  userAvatar?: string | null
  onSpaceSwitch?: () => void
  onLogout?: () => void
}

export function Header({
  space, userName = 'Membre', userEmail, userAvatar, onSpaceSwitch, onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
              <Film className="size-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-black tracking-tight">
              RETECH<span className="text-primary">CI</span>
            </h1>
            {space && (
              <Badge variant="outline" className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold ${
                space === 'director' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted text-muted-foreground border-border'
              }`}>
                {space === 'director' ? <Shield className="size-3" /> : <User className="size-3" />}
                {space === 'director' ? 'Espace Directeur' : 'Espace Membre'}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {space === 'director' && onSpaceSwitch && (
              <Button variant="outline" size="sm" onClick={onSpaceSwitch} className="hidden sm:flex items-center h-8 gap-1.5 text-xs text-muted-foreground">
                <User className="size-3.5" /> Espace Membre
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={userAvatar || undefined} alt={userName} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium">{userName}</p>
                  {userEmail && <p className="text-xs text-muted-foreground">{userEmail}</p>}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
