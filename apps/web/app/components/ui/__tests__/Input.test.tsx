import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'

import { Input, Textarea } from '../Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('displays error message', () => {
    render(<Input label="Email" error="Invalid email" id="email" />)
    expect(screen.getByText('Invalid email')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('displays helper text', () => {
    render(<Input label="Email" helperText="Enter your email address" id="email" />)
    expect(screen.getByText('Enter your email address')).toBeInTheDocument()
  })

  it('accepts user input', async () => {
    const user = userEvent.setup()
    render(<Input label="Name" />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'John Doe')
    
    expect(input).toHaveValue('John Doe')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled label="Disabled" />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})

describe('Textarea', () => {
  it('renders with label', () => {
    render(<Textarea label="Description" />)
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('accepts multi-line input', async () => {
    const user = userEvent.setup()
    render(<Textarea label="Bio" />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Line 1\nLine 2')
    
    expect(textarea).toHaveValue('Line 1\nLine 2')
  })
})
