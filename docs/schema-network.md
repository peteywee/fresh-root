# Network Schema & Paths (summary)

This document summarizes the canonical Network-centric Firestore paths and the primary entities introduced in Project Bible v14.

Core paths (all under a tenant root):

- networks/{networkId}
  - Network document (tenant root)
- networks/{networkId}/corporates/{corpId}
- networks/{networkId}/orgs/{orgId}
- networks/{networkId}/venues/{venueId}
- networks/{networkId}/links/corpOrgLinks/{linkId}
- networks/{networkId}/links/orgVenueAssignments/{assignmentId}
- networks/{networkId}/compliance/adminResponsibilityForm
- networks/{networkId}/users/{uid}
- networks/{networkId}/memberships/{membershipId}

Notes:

- All schedule-related data must contain (or be under a path that contains) `networkId`.
- Compliance subcollections (`/compliance`) are write-only for onboarding service accounts and readable only by network owners and platform super-admins.
- Link documents model relationships (not nested ownerships).

This file is a short companion to the full Project Bible v14: `docs/bible/Project_Bible_v14.0.0.md`.
