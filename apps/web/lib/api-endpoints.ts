/**
 * API Endpoint Registry
 *
 * Central registry of all API endpoints with their OpenAPI metadata
 * Used for auto-generating API documentation
 */

import { z } from "zod";
import type { OpenAPIEndpoint } from "@/lib/openapi-generator";

// Import schemas from types package
import {
  CreateScheduleSchema,
  UpdateScheduleSchema,
  CreateShiftSchema,
  UpdateShiftSchema,
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
} from "@fresh-schedules/types";

/**
 * Complete API endpoint registry
 */
export const API_ENDPOINTS: OpenAPIEndpoint[] = [
  // Authentication endpoints
  {
    path: "/api/session",
    method: "POST",
    summary: "Create session",
    description: "Create a session cookie from Firebase ID token",
    tags: ["Authentication"],
    requiresAuth: false,
    requiresOrg: false,
    requestSchema: z.object({
      idToken: z.string().min(1, "ID token required"),
      expiresIn: z.number().optional(),
    }),
    responseSchema: z.object({
      success: z.boolean(),
      expiresAt: z.number(),
    }),
    rateLimit: { maxRequests: 10, windowMs: 60000 },
  },
  {
    path: "/api/auth/logout",
    method: "POST",
    summary: "Logout",
    description: "Clear session cookie and logout user",
    tags: ["Authentication"],
    requiresAuth: true,
    requiresOrg: false,
    responseSchema: z.object({
      success: z.boolean(),
    }),
  },

  // Schedule endpoints
  {
    path: "/api/schedules",
    method: "GET",
    summary: "List schedules",
    description: "Get all schedules for the organization",
    tags: ["Schedules"],
    requiresAuth: true,
    requiresOrg: true,
    responseSchema: z.object({
      data: z.array(z.any()),
    }),
    rateLimit: { maxRequests: 100, windowMs: 60000 },
  },
  {
    path: "/api/schedules",
    method: "POST",
    summary: "Create schedule",
    description: "Create a new schedule",
    tags: ["Schedules"],
    requiresAuth: true,
    requiresOrg: true,
    roles: ["manager", "admin", "org_owner"],
    requestSchema: CreateScheduleSchema,
    responseSchema: z.any(),
    rateLimit: { maxRequests: 50, windowMs: 60000 },
  },
  {
    path: "/api/schedules/{id}",
    method: "GET",
    summary: "Get schedule",
    description: "Get a specific schedule by ID",
    tags: ["Schedules"],
    requiresAuth: true,
    requiresOrg: true,
    responseSchema: z.any(),
  },
  {
    path: "/api/schedules/{id}",
    method: "PATCH",
    summary: "Update schedule",
    description: "Update an existing schedule",
    tags: ["Schedules"],
    requiresAuth: true,
    requiresOrg: true,
    roles: ["manager", "admin", "org_owner"],
    requestSchema: UpdateScheduleSchema,
    responseSchema: z.any(),
    rateLimit: { maxRequests: 50, windowMs: 60000 },
  },
  {
    path: "/api/schedules/{id}",
    method: "DELETE",
    summary: "Delete schedule",
    description: "Delete a schedule",
    tags: ["Schedules"],
    requiresAuth: true,
    requiresOrg: true,
    roles: ["admin", "org_owner"],
    rateLimit: { maxRequests: 50, windowMs: 60000 },
  },

  // Shift endpoints
  {
    path: "/api/shifts",
    method: "GET",
    summary: "List shifts",
    description: "Get all shifts for the organization",
    tags: ["Shifts"],
    requiresAuth: true,
    requiresOrg: true,
    responseSchema: z.object({
      data: z.array(z.any()),
    }),
    rateLimit: { maxRequests: 100, windowMs: 60000 },
  },
  {
    path: "/api/shifts",
    method: "POST",
    summary: "Create shift",
    description: "Create a new shift",
    tags: ["Shifts"],
    requiresAuth: true,
    requiresOrg: true,
    roles: ["scheduler", "manager", "admin", "org_owner"],
    requestSchema: CreateShiftSchema,
    responseSchema: z.any(),
    rateLimit: { maxRequests: 50, windowMs: 60000 },
  },
  {
    path: "/api/shifts/{id}",
    method: "PATCH",
    summary: "Update shift",
    description: "Update an existing shift",
    tags: ["Shifts"],
    requiresAuth: true,
    requiresOrg: true,
    roles: ["scheduler", "manager", "admin", "org_owner"],
    requestSchema: UpdateShiftSchema,
    responseSchema: z.any(),
    rateLimit: { maxRequests: 50, windowMs: 60000 },
  },

  // Organization endpoints
  {
    path: "/api/organizations",
    method: "GET",
    summary: "List organizations",
    description: "Get organizations for the current user",
    tags: ["Organizations"],
    requiresAuth: true,
    requiresOrg: false,
    responseSchema: z.object({
      data: z.array(z.any()),
    }),
  },
  {
    path: "/api/organizations",
    method: "POST",
    summary: "Create organization",
    description: "Create a new organization",
    tags: ["Organizations"],
    requiresAuth: true,
    requiresOrg: false,
    requestSchema: CreateOrganizationSchema,
    responseSchema: z.any(),
    rateLimit: { maxRequests: 10, windowMs: 60000 },
  },
  {
    path: "/api/organizations/{id}",
    method: "PATCH",
    summary: "Update organization",
    description: "Update organization settings",
    tags: ["Organizations"],
    requiresAuth: true,
    requiresOrg: true,
    roles: ["admin", "org_owner"],
    requestSchema: UpdateOrganizationSchema,
    responseSchema: z.any(),
    rateLimit: { maxRequests: 50, windowMs: 60000 },
  },

  // Onboarding endpoints
  {
    path: "/api/onboarding/profile",
    method: "POST",
    summary: "Create user profile",
    description: "Create initial user profile during onboarding",
    tags: ["Onboarding"],
    requiresAuth: true,
    requiresOrg: false,
    requestSchema: z.object({
      displayName: z.string().min(1),
      email: z.string().email(),
    }),
    rateLimit: { maxRequests: 10, windowMs: 60000 },
  },
  {
    path: "/api/onboarding/verify-eligibility",
    method: "POST",
    summary: "Verify eligibility",
    description: "Check if user is eligible for onboarding",
    tags: ["Onboarding"],
    requiresAuth: true,
    requiresOrg: false,
    requestSchema: z.object({
      email: z.string().email(),
    }),
  },

  // Venue endpoints
  {
    path: "/api/venues",
    method: "GET",
    summary: "List venues",
    description: "Get all venues for the organization",
    tags: ["Venues"],
    requiresAuth: true,
    requiresOrg: true,
    responseSchema: z.object({
      data: z.array(z.any()),
    }),
  },
  {
    path: "/api/venues",
    method: "POST",
    summary: "Create venue",
    description: "Create a new venue",
    tags: ["Venues"],
    requiresAuth: true,
    requiresOrg: true,
    roles: ["manager", "admin", "org_owner"],
    rateLimit: { maxRequests: 50, windowMs: 60000 },
  },

  // Position endpoints
  {
    path: "/api/positions",
    method: "GET",
    summary: "List positions",
    description: "Get all positions for the organization",
    tags: ["Positions"],
    requiresAuth: true,
    requiresOrg: true,
    responseSchema: z.object({
      data: z.array(z.any()),
    }),
  },
  {
    path: "/api/positions",
    method: "POST",
    summary: "Create position",
    description: "Create a new position",
    tags: ["Positions"],
    requiresAuth: true,
    requiresOrg: true,
    roles: ["manager", "admin", "org_owner"],
    rateLimit: { maxRequests: 50, windowMs: 60000 },
  },

  // Health & Metrics
  {
    path: "/api/health",
    method: "GET",
    summary: "Health check",
    description: "Check API health status",
    tags: ["Metrics"],
    requiresAuth: false,
    requiresOrg: false,
    responseSchema: z.object({
      status: z.enum(["ok", "degraded", "down"]),
      timestamp: z.number(),
      version: z.string(),
    }),
  },
  {
    path: "/api/healthz",
    method: "GET",
    summary: "Kubernetes health check",
    description: "Kubernetes liveness probe endpoint",
    tags: ["Metrics"],
    requiresAuth: false,
    requiresOrg: false,
    responseSchema: z.object({
      status: z.string(),
    }),
  },
];
