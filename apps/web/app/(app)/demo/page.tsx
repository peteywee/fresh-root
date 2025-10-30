'use client'

import React, { useState, useCallback } from 'react'

import { Button, Card, Input, Textarea, Loading, Spinner, Alert } from '../../components/ui'

/**
 * Demo page showcasing all UI components
 */
export default function DemoPage() {
  const [loading, setLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setShowAlert(true)
    }, 2000)
  }

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }))
  }, [])

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, email: e.target.value }))
  }, [])

  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, message: e.target.value }))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Component Demo
          </h1>
          <p className="text-gray-600">
            Explore the reusable UI components available in Fresh Schedules
          </p>
        </div>

        {showAlert && (
          <Alert
            type="success"
            title="Success!"
            message="Form submitted successfully!"
            onClose={() => setShowAlert(false)}
          />
        )}

        {/* Buttons */}
        <Card title="Buttons" description="Various button styles and sizes">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="sm">Primary Small</Button>
              <Button variant="primary" size="md">Primary Medium</Button>
              <Button variant="primary" size="lg">Primary Large</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </Card>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card title="Default Card" variant="default">
            <p className="text-gray-600">This is a default card with a border.</p>
          </Card>
          <Card title="Bordered Card" variant="bordered">
            <p className="text-gray-600">This card has a thicker border.</p>
          </Card>
          <Card title="Elevated Card" variant="elevated">
            <p className="text-gray-600">This card has a shadow for elevation.</p>
          </Card>
        </div>

        {/* Form Inputs */}
        <Card
          title="Form Example"
          description="Example form using Input and Textarea components"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleNameChange}
              fullWidth
              helperText="This field is required"
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleEmailChange}
              fullWidth
            />

            <Textarea
              label="Message"
              placeholder="Enter your message"
              rows={4}
              value={formData.message}
              onChange={handleMessageChange}
              fullWidth
            />

            <div className="flex gap-3">
              <Button type="submit" variant="primary" loading={loading}>
                Submit
              </Button>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Loading States */}
        <Card title="Loading States" description="Spinners and loading indicators">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Spinner Sizes</h4>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <Spinner size="sm" />
                  <p className="text-xs text-gray-500 mt-2">Small</p>
                </div>
                <div className="text-center">
                  <Spinner size="md" />
                  <p className="text-xs text-gray-500 mt-2">Medium</p>
                </div>
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className="text-xs text-gray-500 mt-2">Large</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Loading Component</h4>
              <div className="bg-white border rounded-lg p-8">
                <Loading text="Loading data..." />
              </div>
            </div>
          </div>
        </Card>

        {/* Alerts */}
        <Card title="Alerts" description="Different alert types for various scenarios">
          <div className="space-y-3">
            <Alert
              type="success"
              title="Success"
              message="Your changes have been saved successfully."
            />
            <Alert
              type="error"
              title="Error"
              message="There was an error processing your request."
            />
            <Alert
              type="warning"
              title="Warning"
              message="Your session will expire in 5 minutes."
            />
            <Alert
              type="info"
              message="New features have been added to the platform."
            />
          </div>
        </Card>

        {/* Card with Footer */}
        <Card
          title="Card with Footer"
          description="This card demonstrates the footer prop"
          footer={
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Last updated: Just now</span>
              <Button size="sm">View Details</Button>
            </div>
          }
        >
          <p className="text-gray-700">
            Cards can have optional footers for actions or additional information.
            This is useful for displaying metadata or action buttons.
          </p>
        </Card>

        {/* Documentation Link */}
        <Card>
          <div className="text-center py-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Component Documentation
            </h3>
            <p className="text-gray-600 mb-4">
              Learn more about these components and how to use them in your application.
            </p>
            <Button variant="primary">
              View Documentation
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
