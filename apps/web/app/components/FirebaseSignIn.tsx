'use client'
import React, { useEffect, useRef } from 'react'
import { getAuth } from 'firebase/auth'
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

// This component mounts FirebaseUI's sign-in widget into a container.
// It assumes you have initialized firebase in `apps/web/app/lib/firebaseClient.ts`.

export default function FirebaseSignIn() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const auth = getAuth()
    const ui = new firebaseui.auth.AuthUI(auth)

    ui.start(containerRef.current!, {
      signInOptions: [
        // Add providers you want to support; placeholder uses Email
        firebaseui.auth.AnonymousAuthProvider?.PROVIDER_ID,
        firebaseui.auth.EmailAuthProvider?.PROVIDER_ID
      ],
      signInSuccessUrl: '/',
      tosUrl: '/',
      privacyPolicyUrl: '/'
    })

    return () => {
      try {
        ui.delete()
      } catch (e) {
        // ignore if already deleted
      }
    }
  }, [])

  return <div ref={containerRef} />
}
