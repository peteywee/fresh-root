import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Card } from '../Card'

describe('Card', () => {
  it('renders children content', () => {
    render(
      <Card>
        <p>Test content</p>
      </Card>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders with title and description', () => {
    render(
      <Card title="Test Title" description="Test Description">
        <p>Content</p>
      </Card>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('renders footer when provided', () => {
    render(
      <Card footer={<button>Footer Button</button>}>
        <p>Content</p>
      </Card>
    )
    expect(screen.getByText('Footer Button')).toBeInTheDocument()
  })

  it('applies variant styles', () => {
    const { rerender } = render(<Card variant="default">Content</Card>)
    const card = screen.getByText('Content').parentElement
    expect(card).toHaveClass('border-gray-200')
    
    rerender(<Card variant="elevated">Content</Card>)
    expect(screen.getByText('Content').parentElement).toHaveClass('shadow-lg')
  })
})
