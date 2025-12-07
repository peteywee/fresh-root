handler:handler: ({ context, params }) => {
    try {
      const { id } = params;
      const org = {
        id,
        name: "Sample Organization",
        ownerId: context.auth?.userId,
        memberCount: 1,
        createdAt: Date.now(),
      };
      return ok(org);
    } catch {
      return serverError("Failed to fetch organization");
    }
  },
});

/**
 * PATCH /api/organizations/[id]
 * Update organization
 */
export const PATCH = createOrgEndpoint({
  roles: ["admin"],
  handler: async ({ request, context, params }) => {
    try {
      const body = await request.json();
      const { name, settings } = body;
      const updated = {
        id: params.id,
        name,
        settings,
        updatedBy: context.auth?.userId,
      };
      return ok(updated);
    } catch {
      return serverError("Failed to update organization");
    }
  },
});

/**
 * DELETE /api/organizations/[id]
 * Delete organization
 */
export const DELETE = createOrgEndpoint({
  roles: ["admin"],
  handler: ({ _context, params }) => {
    try {
      return ok({ deleted: true, id: params.id });
    } catch {
      return serverError("Failed to delete organization");
    }
  },
});
