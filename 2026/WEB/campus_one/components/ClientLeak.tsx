"use client";

import { useEffect } from "react";

export default function ClientLeak() {
  useEffect(() => {
    // Challenge Hint:
    // We attach configuration to the window object for "client-side hydration".
    // This is a common pattern that leaks data if not careful.
    
    // @ts-ignore
    if (typeof window !== 'undefined') {
        // @ts-ignore
        window.CAMPUS_CONFIG = {
            env: "production",
            build_id: "edu_v4.2.0",
            debug_endpoint: "/api/v2/debug/sessions", // Plain string leak (points to patched v2)
            flags: {
                student_discount: true,
                admin_portal: false 
            }
        };
    }
  }, []);

  return null;
}
