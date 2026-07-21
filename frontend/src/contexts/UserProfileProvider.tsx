import { ReactNode, useMemo, useState } from 'react'
import {
  normalizeDisplayName,
  readDisplayName,
  USER_PROFILE_STORAGE_KEY,
  UserProfileContext,
} from './userProfile'

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [displayName, setDisplayNameState] = useState(readDisplayName)
  const value = useMemo(() => ({
    displayName,
    setDisplayName: (nextName: string) => {
      const normalized = normalizeDisplayName(nextName)
      setDisplayNameState(normalized)
      try {
        window.localStorage.setItem(USER_PROFILE_STORAGE_KEY, normalized)
      } catch {
        // The profile still works for this session when browser storage is unavailable.
      }
    },
  }), [displayName])

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>
}
