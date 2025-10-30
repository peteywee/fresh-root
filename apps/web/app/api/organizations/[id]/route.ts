import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { parseJson, badRequest, ok, serverError } from '../../_shared/validation'

// Schema for updating organization
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
 * GET /api/organizations/[id]
 * Get organization details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // In production, fetch from database and check permissions
    const organization = {
      id,
      name: 'Acme Corp',
      description: 'A great company',
      industry: 'Technology',
      size: '51-200',
      createdAt: new Date().toISOString(),
      settings: {
        allowPublicSchedules: false,
        requireShiftApproval: true,
        defaultShiftDuration: 8,
      },
      memberCount: 25,
    }

    return ok(organization)
  } catch (error) {
    return serverError('Failed to fetch organization')
  }
}

/**
 * PATCH /api/organizations/[id]
 * Update organization details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const parsed = await parseJson(request, UpdateOrgSchema)
    
    if (!parsed.success) {
      return badRequest('Validation failed', parsed.details)
    }

    // In production, update in database after checking permissions
    const updatedOrg = {
      id,
      name: 'Acme Corp',
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    }

    return ok(updatedOrg)
  } catch (error) {
    return serverError('Failed to update organization')
  }
}

/**
 * DELETE /api/organizations/[id]
 * Delete an organization (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // In production, check if user is admin and delete from database
    return ok({ message: 'Organization deleted successfully', id })
  } catch (error) {
    return serverError('Failed to delete organization')
  }
}
