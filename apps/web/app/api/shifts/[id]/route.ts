handler:handler: ({ context, params }) => {
    try {
      const { id } = params;
      const shift = {
        id,
        name: "Sample Shift",
        orgId: context.org?.orgId,
        startTime: Date.now(),
        endTime: Date.now() + 28800000,
      };
      return ok(shift);
    } catch {
      return serverError("Failed to fetch shift");
    }
  },
});

/**
 * PATCH /api/shifts/[id]
 * Update shift
 */
export const PATCH = createOrgEndpoint({
  roles: ["manager"],
  input: UpdateShiftSchema,
  handler: ({ input, context, params }) => {
    try {
      const { name, startTime, endTime } = input;
      const updated = {
        id: params.id,
        name,
        startTime,
        endTime,
        updatedBy: context.auth?.userId,
      };
      return ok(updated);
    } catch {
      return serverError("Failed to update shift");
    }
  },
});

/**
 * DELETE /api/shifts/[id]
 * Delete shift
 */
export const DELETE = createOrgEndpoint({
  roles: ["manager"],
  handler: ({ _context, params }) => {
    try {
      return ok({ deleted: true, id: params.id });
    } catch {
      return serverError("Failed to delete shift");
    }
  },
});
