// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProjectStatus } from './ProjectStatus'

describe('ProjectStatus', () => {
  it('renders the user-facing status label', () => {
    render(<ProjectStatus status="needs_review" />)
    expect(screen.getByText('Needs Review')).toBeTruthy()
  })
})

