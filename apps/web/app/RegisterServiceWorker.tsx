"use client";
import { useEffect } from "react";

import { safeRegisterServiceWorker } from "./lib/registerServiceWorker";

export default function RegisterServiceWorker({ script = "/sw.js" }: { script?: string }) {
  useEffect(() => {
    void safeRegisterServiceWorker(script);
  }, [script]);

  return null;
}
