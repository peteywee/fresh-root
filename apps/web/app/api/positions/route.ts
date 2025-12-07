handler:handler: ({ request, context, _params }) => {
    try {
      const { searchParams } = new URL(request.url);
      const orgId = searchParams.get("orgId") || context.org?.orgId;

      if (!orgId) {
        return badRequest("orgId query parameter is required");
      }

      // Mock data - in production, fetch from Firestore
      const positions = [
        {
          id: "pos-1",
          orgId,
          name: "Event Manager",
          description: "Manages event operations",
          type: "full_time",
          skillLevel: "advanced",
          hourlyRate: 35,
          color: "#3B82F6",
          isActive: true,
          requiredCertifications: [],
        },
      ];

      return ok({ positions, total: positions.length });
    } catch {
      return serverError("Failed to fetch positions");
    }
  },
});

/**
 * POST /api/positions
 * Create new position
 */
export const POST = createOrgEndpoint({
  roles: ["manager"],
  handler: async ({ request, context, _params }) => {
    try {
      const body = await request.json();
      const validated = CreatePositionSchema.parse(body);

      const position = {
        id: `pos-${Date.now()}`,
        orgId: context.org?.orgId,
        ...validated,
        createdBy: context.auth?.userId,
        createdAt: Date.now(),
      };

      return NextResponse.json(position, { status: 201 });
    } catch {
      return serverError("Failed to create position");
    }
  },
});
