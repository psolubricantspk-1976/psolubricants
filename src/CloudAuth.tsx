import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { cloud, errorMessage } from "./cloud";

type AuthState = { session: Session | null; ready: boolean; isAdmin: boolean; roleError: string };
const Context = createContext<AuthState>({ session: null, ready: false, isAdmin: false, roleError: "" });
export function CloudAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!cloud);
  const [role, setRole] = useState({ userId: "", isAdmin: false, error: "" });
  useEffect(() => {
    // The old demo stored passwords in browser storage. Do not migrate those passwords.
    for (const key of ["pso-customer-accounts", "pso-customer-session", "pso-signup-notifications"]) {
      try { localStorage.removeItem(key); } catch { /* Private browsing. */ }
    }
    if (!cloud) return;
    let active = true;
    let changed = false;
    const { data: listener } = cloud.auth.onAuthStateChange((_event, next) => {
      changed = true;
      if (active) { setSession(next); setReady(true); }
    });
    void cloud.auth.getSession().then(({ data, error }) => {
      if (active && !changed) {
        setSession(data.session);
        setReady(true);
        if (error) setRole({ userId: "", isAdmin: false, error: errorMessage(error) });
      }
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const userId = session?.user.id ?? "";
  useEffect(() => {
    if (!cloud || !userId) return;
    let active = true;
    void cloud.rpc("is_admin").then(({ data, error }) => {
      if (active) setRole({ userId, isAdmin: !error && data === true, error: error ? errorMessage(error) : "" });
    });
    return () => { active = false; };
  }, [userId, session?.access_token]);
  return <Context.Provider value={{ session, ready, isAdmin: role.userId === userId && role.isAdmin, roleError: role.userId === userId ? role.error : "" }}>{children}</Context.Provider>;
}
export function useCloudAuth() { return useContext(Context); }
