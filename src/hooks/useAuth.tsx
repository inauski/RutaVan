import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Credits } from "../lib/types";

interface AuthState {
  session: Session | null;
  loading: boolean;
  credits: Credits | null;
  refreshCredits: () => Promise<Credits | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<Credits | null>(null);

  const refreshCredits = useCallback(async () => {
    const { data } = await supabase
      .from("user_credits")
      .select("free_used, paid_credits")
      .maybeSingle();
    setCredits(data ?? null);
    return data ?? null;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) void refreshCredits();
    else setCredits(null);
  }, [session, refreshCredits]);

  const value = useMemo<AuthState>(
    () => ({
      session,
      loading,
      credits,
      refreshCredits,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, loading, credits, refreshCredits],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
