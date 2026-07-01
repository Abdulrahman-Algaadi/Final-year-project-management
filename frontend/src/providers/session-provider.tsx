"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useSearchParams } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { setCachedAccessToken } from "@/lib/api/auth-token";
import { fetchProfile } from "@/lib/api/services/auth.service";
import { invalidateReferenceCache } from "@/lib/api/services/reference.service";
import { ApiError } from "@/lib/api/client";
import type { UserProfile, UserRole } from "@/types";

interface SessionContextValue {
  user: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
  demoRole: UserRole;
  setDemoRole: (role: UserRole) => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (profile: UserProfile | null) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const DEMO_USERS: Record<UserRole, UserProfile> = {
  Student: { id: 1, personId: 1, username: "ahmed.k", email: "ahmed.k@university.edu", role: "Student", firstName: "Ahmed", lastName: "Khan" },
  Advisor: { id: 2, personId: 2, username: "sarah.ahmed", email: "sarah.a@university.edu", role: "Advisor", firstName: "Sarah", lastName: "Ahmed" },
  Admin: { id: 3, personId: 3, username: "admin", email: "admin@university.edu", role: "Admin", firstName: "System", lastName: "Admin" },
  Coordinator: { id: 4, personId: 4, username: "coordinator", email: "coord@university.edu", role: "Coordinator", firstName: "Project", lastName: "Coordinator" },
};

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const [demoRole, setDemoRole] = useState<UserRole>(
    (searchParams.get("role") as UserRole) ?? "Student",
  );
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(!isDemo);
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const initialLoad = useRef(true);

  const getSupabase = useCallback((): SupabaseClient | null => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }, []);

  const demoUser = DEMO_USERS[demoRole];

  const loadSession = useCallback(async () => {
    if (isDemo) {
      setUser(demoUser);
      setLoading(false);
      return;
    }

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
  }, [isDemo, demoUser, getSupabase]);

  useEffect(() => {
    if (isDemo) {
      setUser(demoUser);
      setLoading(false);
      return;
    }
    loadSession();
  }, [isDemo, demoRole, demoUser, loadSession]);

  useEffect(() => {
    if (isDemo) return;

    const supabase = getSupabase();
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setCachedAccessToken(null);
      } else if (session?.access_token) {
        setCachedAccessToken(session.access_token);
      }
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        loadSession();
      }
    });

    return () => subscription.unsubscribe();
  }, [isDemo, loadSession, getSupabase]);

  const signOut = async () => {
    if (!isDemo) {
      try {
        const { logoutApi } = await import("@/lib/api/services/auth.service");
        await logoutApi();
      } catch {
        /* proceed with local sign-out */
      }
      const supabase = getSupabase();
      if (supabase) await supabase.auth.signOut();
    }
    setCachedAccessToken(null);
    setUser(null);
    invalidateReferenceCache();
  };

  return (
    <SessionContext.Provider
      value={{
        user: isDemo ? demoUser : user,
        loading,
        isDemo,
        demoRole,
        setDemoRole,
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
