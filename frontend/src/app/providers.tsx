"use client";

import { ThemeProvider } from "next-themes";
import { OfflineBanner } from "@/components/states/offline-banner";
import { AppToaster } from "@/components/shared/app-toaster";
import { AppProviders } from "@/providers";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AppProviders>
        <OfflineBanner />
        {children}
        <AppToaster />
      </AppProviders>
    </ThemeProvider>
  );
}
