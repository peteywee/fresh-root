// [P0][AUTH][API] Logout endpoint (compat)
// Tags: P0, AUTH, API

import { createPublicEndpoint } from "@fresh-schedules/api-framework";
import { z } from "zod";

import { ok } from "../../_shared/validation";

const LogoutSchema = z.object({}).strict();

/**
 * POST /api/auth/logout
 * Compatibility endpoint for clients/tests expecting this route.
 * Clears server session cookies.
 */
export const POST = createPublicEndpoint({
  input: LogoutSchema,
  handler: async () => {
    const response = ok({ ok: true });

    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    response.cookies.set("isSuperAdmin", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    response.cookies.set("orgId", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  },
});
