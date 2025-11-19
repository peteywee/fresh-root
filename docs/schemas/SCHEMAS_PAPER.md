# Schemas Master Reference

This is the consolidated master reference for all Zod schemas in the project.

**Generated on**: November 12, 2025  
**Location**: `packages/types/src/**/*.ts`  
**Symlinks**: Each schema gets a `.md` file in `docs/schemas/` that points here

## How to use this file

1. All individual schema documentation files (e.g., `LocationSchema.md`) are **symlinks** pointing to this file
2. When you need schema documentation, the symlink provides the same content
3. To update docs for a schema, edit its definition in `packages/types/src/` and the symlink will reflect changes
4. Run `pnpm exec node scripts/ci/auto-symlink-docs.mjs` to auto-generate symlinks for new schemas

## Schema Categories

### Core Domain Schemas

- **LocationSchema** - Address and coordinates for venues/networks
- **NetworkSchema** - Network entity and configuration
- **OrganizationSchema** - Organization entity and settings
- **VenueSchema** - Venue entity with address and coordinates

### Onboarding Schemas

- **CreateOrgOnboardingSchema** - Org creation during onboarding
- **CreateCorporateOnboardingSchema** - Corporate creation during onboarding
- **JoinWithTokenSchema** - Token-based org joining
- **OnboardingStateSchema** - User onboarding progress tracking
- **OnboardingIntentSchema** - User intent (create_org, create_corporate, join_existing)

### Membership & RBAC Schemas

- **MembershipSchema** - Organization membership entity
- **MembershipClaimsSchema** - Role-based access control claims

### Scheduling Schemas

- **ScheduleStatsSchema** - Schedule statistics and metrics
- **UpdateScheduleSchema** - Schedule updates
- **PublishScheduleSchema** - Schedule publishing
- **CloneScheduleSchema** - Schedule cloning

### Shift Management Schemas

- **ShiftAssignmentSchema** - Shift assignment details
- **UpdateShiftSchema** - Shift updates
- **AssignShiftSchema** - Shift assignment request
- **ListShiftsQuerySchema** - Shift list query parameters

### Attendance Schemas

- **AttendanceRecordSchema** - Attendance record entity
- **CreateAttendanceRecordSchema** - Create attendance record
- **CheckInSchema** - Check-in action
- **CheckOutSchema** - Check-out action
- **UpdateAttendanceRecordSchema** - Update attendance record

### Compliance Schemas

- **AdminResponsibilityFormSchema** - Admin compliance form
- **CertificationSchema** - Certification details

### Event & Error Schemas

- **EventSchema** - Event log entry
- **EventPayloadSchema** - Event payload structure
- **ErrorResponseSchema** - Canonical error response format

### Position & Zone Schemas

- **PositionSchema** - Position/role entity
- **ZoneSchema** - Zone entity for area grouping

### Join Token Schemas

- **JoinTokenSchema** - Join token entity
- **CreateJoinTokenSchema** - Token creation request
- **UpdateJoinTokenSchema** - Token updates
- **RedeemJoinTokenSchema** - Token redemption

### Link & Assignment Schemas

- **CorpOrgLinkSchema** - Corporate-Organization link
- **OrgVenueAssignmentSchema** - Organization-Venue assignment

---

## Guidelines for Schema Documentation

1. **Always export schemas with `*Schema` suffix** (required for auto-symlink detection)
2. **Use Zod for all validation** - no raw TypeScript types in user-facing APIs
3. **Document constraints** - min/max, enum values, format requirements
4. **Provide examples** - show valid input/output for complex schemas
5. **Link to tests** - reference test files that validate each schema

---

See `.github/workflows/doc-parity.yml` for automated validation of schema documentation.


## TEST SPEC

- TODO: Add tests for this doc. Example: `apps/web/app/api/onboarding/__tests__/onboarding-consolidated.test.ts`
