// [P1][INTEGRITY][VALIDATION] Validation
// Tags: P1, INTEGRITY, VALIDATION
import { NextResponse } from "next/server";
import { z } from "zod";
/** Build a 400 error response with consistent shape */
export function badRequest(message, details, code = "BAD_REQUEST") {
    return NextResponse.json({ error: { code, message, details } }, { status: 400 });
}
/** Build a 500 error response with consistent shape */
export function serverError(message = "Internal Server Error", details, code = "INTERNAL") {
    return NextResponse.json({ error: { code, message, details } }, { status: 500 });
}
/** Build a 200 response */
export function ok(data) {
    return NextResponse.json(data, { status: 200 });
}
/** Utility to parse JSON request bodies against a Zod schema */
export async function parseJson(req, schema) {
    let json;
    try {
        json = await req.json();
    }
    catch {
        throw new Error("Invalid JSON");
    }
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
        const details = parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
        }));
        return { success: false, details };
    }
    return { success: true, data: parsed.data };
}
export const OrganizationCreateSchema = z.object({
    name: z.string().min(1, "Organization name is required").max(100),
    description: z.string().max(500).optional(),
    settings: z.record(z.unknown()).optional(),
});
// Schedule schemas
export const UpdateScheduleSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
});
// Shift schemas
export const ShiftStatus = z.enum(["draft", "published", "in_progress", "completed", "cancelled"]);
export const CreateShiftSchema = z
    .object({
    orgId: z.string().min(1, "Organization ID is required"),
    scheduleId: z.string().min(1, "Schedule ID is required"),
    positionId: z.string().min(1, "Position ID is required"),
    venueId: z.string().optional(),
    zoneId: z.string().optional(),
    startTime: z.number().int().positive(),
    endTime: z.number().int().positive(),
    requiredStaff: z.number().int().positive().default(1),
    notes: z.string().max(1000).optional(),
    breakMinutes: z.number().int().nonnegative().optional(),
})
    .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
});
export const UpdateShiftSchema = z.object({
    positionId: z.string().min(1).optional(),
    venueId: z.string().optional(),
    zoneId: z.string().optional(),
    startTime: z.number().int().positive().optional(),
    endTime: z.number().int().positive().optional(),
    status: ShiftStatus.optional(),
    requiredStaff: z.number().int().positive().optional(),
    notes: z.string().max(1000).optional(),
    breakMinutes: z.number().int().nonnegative().optional(),
});
/**
 * Admin Responsibility Form schema for onboarding
 * @see docs/bible/Project_Bible_v14.0.0.md Section 4.3
 */
export const CreateAdminResponsibilityFormSchema = z.object({
    legalBusinessName: z.string().min(1, "Legal business name is required"),
    taxId: z.string().min(1, "Tax ID is required"),
    businessAddress: z.object({
        street: z.string().min(1, "Street address is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(2, "State is required").max(2),
        zipCode: z.string().min(5, "Zip code is required"),
    }),
    adminName: z.string().min(1, "Administrator name is required"),
    adminEmail: z.string().email("Valid email is required"),
    adminPhone: z.string().min(10, "Valid phone number is required"),
    acceptedTerms: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions",
    }),
    acceptedAt: z.string().datetime().optional(),
});
