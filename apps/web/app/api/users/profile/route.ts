import { NextRequest } from 'next/server'
import { z } from 'zod'

import { parseJson, badRequest, ok, serverError } from '../../_shared/validation'

// Schema for updating user profile
const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    notifications: z.boolean().optional(),
    language: z.string().length(2).optional(),
  }).optional(),
})

/**
 * GET /api/users/profile
 * Get the current user's profile
 */
export async function GET(_request: NextRequest) {
  try {
    // In production, extract user from auth token/session
    // For now, return a mock profile
    const userProfile = {
      id: 'user-123',
      email: 'user@example.com',
      displayName: 'John Doe',
      bio: 'Software developer',
      phoneNumber: '+1234567890',
      photoURL: null,
      createdAt: new Date().toISOString(),
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en',
      },
    }

    return ok(userProfile)
  } catch (_error) {
    return serverError('Failed to fetch user profile')
  }
}

/**
 * PATCH /api/users/profile
 * Update the current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const parsed = await parseJson(request, UpdateProfileSchema)
    
    if (!parsed.success) {
      return badRequest('Validation failed', parsed.details)
    }

    // In production, update user in database
    // For now, return updated mock data
    const updatedProfile = {
      id: 'user-123',
      email: 'user@example.com',
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    }

    return ok(updatedProfile)
  } catch (_error) {
    return serverError('Failed to update profile')
  }
}
