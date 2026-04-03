"use client"

import { useState, useEffect, useCallback } from "react"

type ActiveSpace = 'member' | 'admin'
type UserRole = 'member' | 'director' | 'president' | 'treasurer' | 'admin'

const ADMIN_ROLES: UserRole[] = ['director', 'president', 'treasurer', 'admin']

export function useActiveSpace(userRole: UserRole) {
  const defaultSpace: ActiveSpace = ADMIN_ROLES.includes(userRole) ? 'admin' : 'member'

  // Lire depuis localStorage au montage
  const [activeSpace, setActiveSpaceState] = useState<ActiveSpace>(() => {
    if (typeof window === 'undefined') return defaultSpace
    const saved = localStorage.getItem('retechci_activeSpace') as ActiveSpace | null
    if (saved && (saved === 'admin' || saved === 'member')) {
      if (saved === 'admin' && !ADMIN_ROLES.includes(userRole)) return defaultSpace
      return saved
    }
    return defaultSpace
  })

  // Cross-tab sync via StorageEvent
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'retechci_activeSpace') {
        const newVal = e.newValue as ActiveSpace | null
        if (newVal && (newVal === 'admin' || newVal === 'member')) {
          if (newVal === 'admin' && !ADMIN_ROLES.includes(userRole)) return
          setActiveSpaceState(newVal)
        }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [userRole])

  const setActiveSpace = useCallback((space: ActiveSpace) => {
    if (space === 'admin' && !ADMIN_ROLES.includes(userRole)) return
    setActiveSpaceState(space)
    localStorage.setItem('retechci_activeSpace', space)
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'retechci_activeSpace',
      newValue: space,
    }))
  }, [userRole])

  const canSwitch = ADMIN_ROLES.includes(userRole)

  return { activeSpace, setActiveSpace, canSwitch }
}
