# UI Components

This directory contains reusable UI components for the Fresh Schedules application.

## Components

### Button

A versatile button component with multiple variants and sizes.

**Props:**
- `variant`: `'primary' | 'secondary' | 'danger' | 'ghost'` - Button style variant
- `size`: `'sm' | 'md' | 'lg'` - Button size
- `loading`: `boolean` - Show loading spinner
- All standard HTML button attributes

**Example:**
```tsx
import { Button } from '@/components/ui'

<Button variant="primary" size="md" onClick={handleClick}>
  Save Changes
</Button>

<Button variant="danger" loading={isDeleting} onClick={handleDelete}>
  Delete
</Button>
```

---

### Card

A container component for displaying content in a styled box.

**Props:**
- `title`: `string` - Card header title
- `description`: `string` - Card header description
- `variant`: `'default' | 'bordered' | 'elevated'` - Card style variant
- `footer`: `ReactNode` - Optional footer content
- `className`: `string` - Additional CSS classes

**Example:**
```tsx
import { Card } from '@/components/ui'

<Card 
  title="User Settings" 
  description="Manage your account preferences"
  footer={<Button>Save</Button>}
>
  <p>Card content goes here</p>
</Card>
```

---

### Input & Textarea

Form input components with label, error, and helper text support.

**Props:**
- `label`: `string` - Input label
- `error`: `string` - Error message to display
- `helperText`: `string` - Helper text below input
- `fullWidth`: `boolean` - Make input full width
- All standard HTML input/textarea attributes

**Example:**
```tsx
import { Input, Textarea } from '@/components/ui'

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
  helperText="We'll never share your email"
/>

<Textarea
  label="Description"
  rows={4}
  placeholder="Enter description"
/>
```

---

### Loading & Spinner

Loading indicators for async operations.

**Spinner Props:**
- `size`: `'sm' | 'md' | 'lg'` - Spinner size
- `className`: `string` - Additional CSS classes

**Loading Props:**
- `text`: `string` - Loading text to display
- `fullScreen`: `boolean` - Cover entire screen

**Example:**
```tsx
import { Spinner, Loading } from '@/components/ui'

// Small spinner
<Spinner size="sm" />

// Full loading state
<Loading text="Loading data..." fullScreen />

// Inline loading
{isLoading ? <Loading text="Fetching..." /> : <DataTable />}
```

---

### Alert

Display important messages to users.

**Props:**
- `type`: `'success' | 'error' | 'warning' | 'info'` - Alert type
- `title`: `string` - Alert title
- `message`: `string` - Alert message
- `onClose`: `() => void` - Close handler
- `className`: `string` - Additional CSS classes

**Example:**
```tsx
import { Alert } from '@/components/ui'

<Alert
  type="success"
  title="Success"
  message="Profile updated successfully!"
  onClose={() => setShowAlert(false)}
/>

<Alert
  type="error"
  message="Failed to save changes"
/>
```

---

## Usage with Forms

### Basic Form Example

```tsx
'use client'

import { useState } from 'react'
import { Input, Button, Card, Alert } from '@/components/ui'

export default function ProfileForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      // API call here
      setSuccess(true)
    } catch (err) {
      setError('Failed to update profile')
    }
  }

  return (
    <Card title="Edit Profile" description="Update your information">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message="Profile updated!" />}
        
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        
        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
          <Button type="button" variant="secondary" onClick={() => {}}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
```

## Styling

All components use Tailwind CSS utility classes and follow a consistent design system. You can customize colors and spacing by modifying the Tailwind configuration.

## Accessibility

Components follow accessibility best practices:
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader friendly
- Focus management

## Testing

All components have unit tests. Run tests with:

```bash
pnpm test
```

## Contributing

When adding new components:
1. Create the component in this directory
2. Add comprehensive tests in `__tests__/`
3. Export from `index.ts`
4. Document props and usage here
5. Add examples in the docs
