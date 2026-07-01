"use client";

import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "@/providers/locale-provider";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 bg-warning px-4 py-2 text-sm font-medium text-warning-foreground"
          role="alert"
        >
          <WifiOff className="size-4" aria-hidden />
          {t("states.offline")}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
