#!/usr/bin/env bash
set -euo pipefail

# --------
# Fresh Schedules — Project Bible v11 “Onboarding + Session + Orgs + Tokens + Approvals + Rules” Drop
# This script writes all required files for the current scope.
# --------

# Helpers
write() {
  local path="$1"
  shift
  mkdir -p "$(dirname "$path")"
  cat > "$path" <<'EOF'
$CONTENT
EOF
  # Replace placeholder with actual content passed via heredoc style
}

# Because we can’t pass variables into the inline heredocs easily, we’ll declare each file with its own heredoc.

# ===============================
# 1) FIREBASE RULES (FIRESTORE + STORAGE)
# ===============================

# firestore.rules (v10/v11 superset — includes messages/receipts)
mkdir -p .
cat > firestore.rules <<'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isUser(userId) { return isSignedIn() && request.auth.uid == userId; }
    function getRole(orgId) { return (request.auth.token.roles != null) ? request.auth.token.roles[orgId] : null; }
    function isAdmin(orgId) {
      let role = getRole(orgId);
      return role in ['org_owner','org_admin','admin','manager'];
    }
    function isMember(orgId) {
      let role = getRole(orgId);
      return role in ['org_owner','org_admin','org_member','admin','manager','member'];
    }

    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isUser(userId);
    }

    match /join_tokens/{tokenId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && isAdmin(request.resource.data.orgId);
      allow delete: if isSignedIn() && isAdmin(resource.data.orgId);
    }

    match /organizations/{orgId} {
      allow get, list: if isMember(orgId);
      allow create: if isSignedIn();
      allow update: if isSignedIn() && isAdmin(orgId);

      match /members/{userId} {
        allow read: if isMember(orgId) || isUser(userId);
        allow create: if isUser(userId);
        allow update: if isAdmin(orgId) || isUser(userId);
        allow delete: if isAdmin(orgId);
      }

      match /schedules/{scheduleId} {
        allow read: if isMember(orgId);
        allow create, update, delete: if isAdmin(orgId);
        match /shifts/{shiftId} {
          allow read: if isMember(orgId);
          allow create, update, delete: if isAdmin(orgId) || request.auth.uid == request.resource.data.userId;
        }
      }

      match /certifications/{certId} {
        allow read: if isMember(orgId);
        allow create: if isSignedIn();
        allow update: if isAdmin(orgId);
        allow delete: if isAdmin(orgId);
      }

      match /messages/{messageId} {
        allow create: if isSignedIn() && isAdmin(orgId);
        allow read: if isSignedIn() && (
          resource.data.targets == 'all' ||
          (resource.data.targets == 'members' && isMember(orgId)) ||
          (resource.data.targets == 'user' && (request.auth.uid in resource.data.recipients))
        );
        match /receipts/{userId} {
          allow write: if isUser(userId);
          allow read: if isUser(userId) || isAdmin(orgId);
        }
      }

      match /attendance_records/{recordId} {
        allow read: if (isMember(orgId) && resource.data.userId == request.auth.uid) || isAdmin(orgId);
        allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
        allow update: if isAdmin(orgId);
      }
    }

    match /attendance_ledger/{ledgerEntryId} {
      allow read, write: if false;
    }
  }
}
EOF

# storage.rules
cat > storage.rules <<'EOF'
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /organizations/{orgId}/{userId}/{fileName} {
      allow write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && (
        (request.auth.token.roles[orgId] in ['org_owner', 'org_admin']) || request.auth.uid == userId
      );
    }
  }
}
EOF

# ===============================
# 2) SERVER SDK (Admin) — if missing
# ===============================
cat > apps/web/src/lib/firebase.server.ts <<'EOF'
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin SDK Initialized');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
EOF

# ===============================
# 3) CLIENT SDK — if missing
# ===============================
cat > apps/web/src/lib/firebase.client.ts <<'EOF'
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

setPersistence(auth, browserLocalPersistence);

if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  console.log('Firebase Emulators connected');
} else {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    console.error("Firebase offline persistence error:", err);
  });
}

export { app, auth, db, storage };
EOF

# ===============================
# 4) ACTION CODE SETTINGS
# ===============================
cat > apps/web/src/lib/actionCodeSettings.ts <<'EOF'
export const actionCodeSettings = {
  url: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
  handleCodeInApp: true,
};
EOF

# ===============================
# 5) AUTH HELPERS (client)
# ===============================
cat > apps/web/src/lib/auth-helpers.ts <<'EOF'
import { auth } from './firebase.client';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
