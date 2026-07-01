"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadProfile = useCallback(async () => {
    if (!supabase) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null);
        return;
      }

      // Demo profile until API keys are configured
      setUser({
        id: 1,
        personId: 1,
        username: session.user.email?.split("@")[0] ?? "user",
        email: session.user.email ?? "",
        role: (session.user.user_metadata?.role as UserProfile["role"]) ?? "Student",
        firstName: session.user.user_metadata?.first_name,
        lastName: session.user.user_metadata?.last_name,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    loadProfile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });
    return () => subscription.unsubscribe();
  }, [loadProfile, supabase]);

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signOut, refresh: loadProfile };
}
