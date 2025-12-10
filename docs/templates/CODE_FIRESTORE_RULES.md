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
