"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { setCachedAccessToken } from "@/lib/api/auth-token";
import { fetchProfile } from "@/lib/api/services/auth.service";
import { invalidateReferenceCache } from "@/lib/api/services/reference.service";
import { ApiError } from "@/lib/api/client";
import type { UserProfile } from "@/types";

interface SessionContextValue {
  user: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (profile: UserProfile | null) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const initialLoad = useRef(true);

  const getSupabase = useCallback((): SupabaseClient | null => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }, []);

  const loadSession = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setCachedAccessToken(null);
      setUser(null);
      setLoading(false);
      return;
    }

    if (initialLoad.current) {
      setLoading(true);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setCachedAccessToken(null);
        setUser(null);
        return;
      }
      setCachedAccessToken(session.access_token);
      const profile = await fetchProfile(session.access_token);
      setUser(profile);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await supabase.auth.signOut();
      }
      setCachedAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
      initialLoad.current = false;
    }
  }, [getSupabase]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setCachedAccessToken(null);
      } else if (session?.access_token) {
        setCachedAccessToken(session.access_token);
      }
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        window.setTimeout(() => {
          void loadSession();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadSession, getSupabase]);

  const signOut = async () => {
    try {
      const { logoutApi } = await import("@/lib/api/services/auth.service");
      await logoutApi();
    } catch {
      /* proceed with local sign-out */
    }
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    setCachedAccessToken(null);
    setUser(null);
    invalidateReferenceCache();
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        loading,
        signOut,
        refresh: loadSession,
        setUser,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
