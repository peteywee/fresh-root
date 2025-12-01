// [P0][CORE][API] Widgets management endpoint
import { NextResponse } from "next/server";
import { createPublicEndpoint } from "@fresh-schedules/api-framework";

export const POST = createPublicEndpoint({
  handler: async () => {
    return NextResponse.json({ ok: true }, { status: 200 });
  },
});
