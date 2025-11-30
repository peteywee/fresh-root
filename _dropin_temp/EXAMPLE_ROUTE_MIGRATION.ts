// [P0][API][CODE] EXAMPLE ROUTE MIGRATION
// Tags: P0, API, CODE
/**
 * EXAMPLE: How to Migrate Your Routes to the SDK
 *
 * This file shows the BEFORE and AFTER for migrating a route.
 * Use this as a template for your existing routes.
 */

// =============================================================================
// BEFORE: Your current pattern (verbose, repetitive)
// =============================================================================

/*
import { NextRequest, NextResponse } from 'next/server';
import { withSecurity } from '@/lib/middleware/security';
import { requireOrgMembership, requireRole } from '@/lib/middleware/auth';
import { adminDb } from '@/lib/firebase-admin';

export const GET = withSecurity(
  requireOrgMembership(
    requireRole(['staff', 'manager', 'admin', 'owner'])(
      async (request: NextRequest, context: { params: { orgId: string } }) => {
        try {
          const { orgId } = context.params;
          
          // Manual validation
          if (!orgId) {
            return NextResponse.json(
              { error: 'Organization ID required' },
              { status: 400 }
            );
          }
          
          const snapshot = await adminDb
            .collection(`organizations/${orgId}/positions`)
            .orderBy('createdAt', 'desc')
            .get();
          
          const positions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          return NextResponse.json({ positions });
          
        } catch (error) {
          console.error('Error fetching positions:', error);
          return NextResponse.json(
            { error: 'Failed to fetch positions' },
            { status: 500 }
          );
        }
      }
    )
  )
);
*/

// =============================================================================
// AFTER: Using the SDK (clean, declarative)
// =============================================================================

import { z } from "zod";
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { getFirestore } from "firebase-admin/firestore";

// Define your input schema (Zod handles validation automatically)
const ListPositionsInput = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export const GET = createOrgEndpoint({
  // Declarative: who can access this?
  roles: ["staff", "manager", "admin", "owner"],

  // Declarative: rate limiting
  rateLimit: { maxRequests: 100, windowMs: 60000 },

  // Declarative: input validation
  input: ListPositionsInput,

  // Your business logic - that's ALL you write
  handler: async ({ input, context }) => {
    const db = getFirestore();
    const { orgId } = context.org!;
    const { limit, offset } = input;

    const snapshot = await db
      .collection(`organizations/${orgId}/positions`)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .get();

    return {
      positions: snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    };
  },
});

// =============================================================================
// WHAT THE SDK HANDLES FOR YOU:
// =============================================================================
// ✓ Session cookie verification
// ✓ User authentication
// ✓ Organization membership check
// ✓ Role-based access control
// ✓ Rate limiting
// ✓ Input validation with Zod
// ✓ Consistent error responses with error codes
// ✓ Request ID generation
// ✓ Audit logging
// ✓ Global error handling
//
// Lines of code: ~100 → ~25
// =============================================================================
