handler:handler: ({ context }) => {
    try {
      const session = {
        userId: context.auth?.userId,
        email: context.auth?.email,
        emailVerified: context.auth?.emailVerified,
        authenticated: true,
      };
      return ok(session);
    } catch {
      return serverError("Failed to bootstrap session");
    }
  },
});

/**
 * POST /api/session/bootstrap
 * Create new session
 */
export const POST = createAuthenticatedEndpoint({
  handler: async ({ request, context }) => {
    try {
      const body = await request.json();
      const session = {
        userId: context.auth?.userId,
        email: context.auth?.email,
        createdAt: Date.now(),
        ...body,
      };
      return ok(session);
    } catch {
      return serverError("Failed to create session");
    }
  },
});
