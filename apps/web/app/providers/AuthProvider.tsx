// [P0][AUTH][CODE] AuthProvider
// Tags: P0, AUTH, CODE
"use client";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";

import { app } from "../../lib/firebaseClient";

type Membership = { orgId: string; role: "admin" | "manager" | "staff" };
type AppUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  memberships: Membership[];
};

const Ctx = createContext<{
  user: AppUser | null;
  loading: boolean;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}>({
  user: null,
  loading: true,
  signInGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      const db = getFirestore(app);
      const uref = doc(db, "users", fbUser.uid);
      const snap = await getDoc(uref);
      if (!snap.exists()) {
        await setDoc(uref, {
          uid: fbUser.uid,
          email: fbUser.email ?? null,
          displayName: fbUser.displayName ?? null,
          createdAt: serverTimestamp(),
        });
      }
      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        memberships: [],
      });
      setLoading(false);
    });
    return () => unsub();
  }, []);
  const signInGoogle = async () => {
    await signInWithPopup(getAuth(app), new GoogleAuthProvider());
  };
  const signOut = async () => {
    await fbSignOut(getAuth(app));
  };
  return <Ctx.Provider value={{ user, loading, signInGoogle, signOut }}>{children}</Ctx.Provider>;
};
export const useAuth = () => useContext(Ctx);
