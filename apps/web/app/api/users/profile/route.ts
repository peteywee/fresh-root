handler:handler: ({ context }) => {
    try {
      const profile = {
        userId: context.auth?.userId,
        email: context.auth?.email,
        emailVerified: context.auth?.emailVerified,
        customClaims: context.auth?.customClaims,
      };
      return ok(profile);
    } catch {
      return serverError("Failed to fetch profile");
    }
  },
});
