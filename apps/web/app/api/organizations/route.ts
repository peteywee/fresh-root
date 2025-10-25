import { NextRequest, NextResponse } from 'next/server'
import { parseJson, badRequest, ok, serverError } from '../_shared/validation'
import { z } from 'zod'

// Schema for creating an organization
const CreateOrgSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  industry: z.string().optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
})

// Schema for updating an organization
const UpdateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  industry: z.string().optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  settings: z.object({
    allowPublicSchedules: z.boolean().optional(),
    requireShiftApproval: z.boolean().optional(),
    defaultShiftDuration: z.number().positive().optional(),
  }).optional(),
})

/**
 * GET /api/organizations
 * List organizations the current user belongs to
 */
export async function GET(request: NextRequest) {
  try {
    // In production, fetch from database based on authenticated user
    const organizations = [
      {
        id: 'org-1',
        name: 'Acme Corp',
        description: 'A great company',
        role: 'admin',
        createdAt: new Date().toISOString(),
        memberCount: 25,
      },
      {
        id: 'org-2',
        name: 'Tech Startup',
        description: 'Innovative solutions',
        role: 'manager',
        createdAt: new Date().toISOString(),
        memberCount: 10,
      },
    ]

    return ok({ organizations })
  } catch (error) {
    return serverError('Failed to fetch organizations')
  }
}

/**
 * POST /api/organizations
 * Create a new organization
 */
export async function POST(request: NextRequest) {
  try {
    const parsed = await parseJson(request, CreateOrgSchema)
    
    if (!parsed.success) {
      return badRequest('Validation failed', parsed.details)
    }

    // In production, create organization in database
    const newOrg = {
      id: `org-${Date.now()}`,
      ...parsed.data,
      role: 'admin', // Creator is admin
      createdAt: new Date().toISOString(),
      memberCount: 1,
    }

    return ok(newOrg)
  } catch (error) {
    return serverError('Failed to create organization')
  }
}
