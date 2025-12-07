handler:handler: ({ request, _context }) => {
    try {
      const url = new URL(request.url);
      const message = url.searchParams.get("message") ?? "Hello from SDK endpoint";
      return NextResponse.json({ ok: true, message });
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Server error";
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }
  },
});

export const POST = createPublicEndpoint({
  input: TemplatePostSchema,
  handler: ({ input }) => {
    return NextResponse.json({ ok: true, payload: input }, { status: 201 });
  },
});

export const HEAD = createPublicEndpoint({
  handler: () => new Response(null, { status: 200 }),
});

// Optional examples; keep thin in real handlers.
export const DELETE = async () => NextResponse.json({ ok: true });
export const PATCH = async () => NextResponse.json({ ok: true });
