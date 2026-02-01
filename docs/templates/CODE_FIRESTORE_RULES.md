---

title: "Firestore Security Rules Template"
description: "Template for Firestore security rules with common patterns"
keywords:
- template
- firestore
- security
- rules
- firebase
category: "template"
status: "active"
audience:
- developers
related-docs:
- CODE\_NEXT\_API\_ROUTE.md
- ../standards/SDK\_FACTORY\_COMPREHENSIVE\_GUIDE.md

createdAt: "2026-01-31T12:00:00Z"
lastUpdated: "2026-01-31T12:00:00Z"

---

# Template: CODE_FIRESTORE_RULES

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function hasRole(r) {
      return request.auth != null &&
             (r in request.auth.token.roles || r in request.auth.token.role);
    }
    function inOrg(orgId) {
      return request.auth != null &&
             orgId in request.auth.token.orgs;
    }

    match /orgs/{orgId}/{document=**} {
      allow read: if inOrg(orgId);
      allow write: if inOrg(orgId) && (hasRole('admin') || hasRole('manager'));
    }

    match /users/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```
