"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadProfile = useCallback(async () => {
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
  }, [supabase.auth]);

  useEffect(() => {
    loadProfile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });
    return () => subscription.unsubscribe();
  }, [loadProfile, supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signOut, refresh: loadProfile };
}
