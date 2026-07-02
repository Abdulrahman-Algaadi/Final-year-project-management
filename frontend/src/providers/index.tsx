"use client";

import { Suspense } from "react";
import { SessionProvider } from "@/providers/session-provider";
import { LocaleProvider } from "@/providers/locale-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ReferencePrefetcher } from "@/components/shared/reference-prefetcher";
import { RuntimeConfigLoader } from "@/components/shared/runtime-config-loader";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <QueryProvider>
        <Suspense fallback={null}>
          <RuntimeConfigLoader>
            <SessionProvider>
              <ReferencePrefetcher />
              {children}
            </SessionProvider>
          </RuntimeConfigLoader>
        </Suspense>
      </QueryProvider>
    </LocaleProvider>
  );
}
