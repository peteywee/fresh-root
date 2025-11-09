// [P2][APP][CODE] RegisterServiceWorker
// Tags: P2, APP, CODE
"use client";
import { useEffect } from "react";

import { safeRegisterServiceWorker } from "./lib/registerServiceWorker";

/**
 * A client-side component that registers the service worker for the PWA.
 *
 * @param {object} props - The props for the component.
 * @param {string} [props.script=/sw.js] - The path to the service worker script.
 * @returns {null} This component does not render anything.
 */
export default function RegisterServiceWorker({ script = "/sw.js" }: { script?: string }) {
  useEffect(() => {
    void safeRegisterServiceWorker(script);
  }, [script]);

  return null;
}
