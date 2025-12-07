handler:handler: ({ request, context, _params }) => {
    try {
      const { searchParams } = new URL(request.url);
      const orgId = searchParams.get("orgId") || context.org?.orgId;

      if (!orgId) {
        return badRequest("orgId query parameter is required");
      }

      // Mock data - in production, fetch from Firestore
      const shifts = [
        {
          id: "shift-1",
          orgId,
          name: "Morning Shift",
          startTime: 8 * 60,
          endTime: 16 * 60,
          isActive: true,
        },
      ];

      return ok({ shifts, total: shifts.length });
    } catch {
      return serverError("Failed to fetch shifts");
    }
  },
});

/**
 * POST /api/shifts
 * Create new shift
 */
export const POST = createOrgEndpoint({
  roles: ["manager"],
  input: CreateShiftSchema,
  handler: ({ input, context, _params }) => {
    try {
      const validated = input;

      const shift = {
        id: `shift-${Date.now()}`,
        orgId: context.org?.orgId,
        ...validated,
        createdBy: context.auth?.userId,
        createdAt: Date.now(),
      };

      return NextResponse.json(shift, { status: 201 });
    } catch {
      return serverError("Failed to create shift");
    }
  },
});
