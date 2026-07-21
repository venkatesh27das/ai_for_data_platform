import { describe, expect, it } from 'vitest'
import { displayInitials, givenName } from './userProfile'

describe('user profile formatting', () => {
  it('derives initials and greeting name from a display name', () => {
    expect(displayInitials('Jane Doe')).toBe('JD')
    expect(givenName('Jane Doe')).toBe('Jane')
  })

  it('normalizes blank and single-word names', () => {
    expect(displayInitials('  Prince  ')).toBe('P')
    expect(displayInitials('')).toBe('LU')
    expect(givenName('')).toBe('Local')
  })
})
