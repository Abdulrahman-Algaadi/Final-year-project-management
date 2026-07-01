"use client";

import { useEffect, useState } from "react";
import { loadRuntimeConfig } from "@/lib/runtime-config";
import { resetSupabaseClient } from "@/lib/supabase/client";

/** Fetches /api/public-config on Vercel when build-time NEXT_PUBLIC_* vars are empty. */
export function RuntimeConfigLoader({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void loadRuntimeConfig().then(() => {
      if (active) {
        resetSupabaseClient();
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/30">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
