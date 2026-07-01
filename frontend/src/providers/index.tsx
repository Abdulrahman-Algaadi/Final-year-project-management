"use client";

import { Suspense } from "react";
import { SessionProvider } from "@/providers/session-provider";
import { AppDataProvider } from "@/providers/app-data-provider";
import { LocaleProvider } from "@/providers/locale-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ReferencePrefetcher } from "@/components/shared/reference-prefetcher";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <QueryProvider>
        <Suspense fallback={null}>
          <AppDataProvider>
            <SessionProvider>
              <ReferencePrefetcher />
              {children}
            </SessionProvider>
          </AppDataProvider>
        </Suspense>
      </QueryProvider>
    </LocaleProvider>
  );
}
