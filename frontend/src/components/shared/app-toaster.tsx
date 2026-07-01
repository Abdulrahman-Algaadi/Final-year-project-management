"use client";

import { Toaster } from "sonner";
import { useTranslation } from "@/providers/locale-provider";

export function AppToaster() {
  const { dir } = useTranslation();
  return (
    <Toaster
      closeButton
      position={dir === "rtl" ? "top-left" : "top-right"}
      toastOptions={{
        classNames: {
          toast: "rounded-xl border shadow-lg",
        },
      }}
    />
  );
}
