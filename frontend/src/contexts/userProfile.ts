import { createContext, useContext } from 'react'

export const USER_PROFILE_STORAGE_KEY = 'ai-data-modelling-assistant.user-profile'
const FALLBACK_NAME = 'Local User'

export interface UserProfileContextValue {
  displayName: string
  setDisplayName: (displayName: string) => void
}

export const UserProfileContext = createContext<UserProfileContextValue | null>(null)

export function useUserProfile(): UserProfileContextValue {
  const profile = useContext(UserProfileContext)
  if (!profile) throw new Error('useUserProfile must be used within UserProfileProvider')
  return profile
}

export function displayInitials(displayName: string): string {
  const parts = normalizeDisplayName(displayName).split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'LU'
}

export function givenName(displayName: string): string {
  return normalizeDisplayName(displayName).split(/\s+/)[0] || FALLBACK_NAME
}

export function readDisplayName(): string {
  try {
    const stored = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY)
    if (stored?.trim()) return normalizeDisplayName(stored)
  } catch {
    // Use the configured fallback when browser storage is unavailable.
  }
  return normalizeDisplayName(import.meta.env.VITE_USER_NAME ?? FALLBACK_NAME)
}

export function normalizeDisplayName(displayName: string): string {
  return displayName.trim().replace(/\s+/g, ' ') || FALLBACK_NAME
}
