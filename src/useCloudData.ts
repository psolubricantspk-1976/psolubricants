import { useEffect, useState } from "react";
import { cloud, CLOUD_CHANGED, errorMessage } from "./cloud";
import { useCloudAuth } from "./CloudAuth";

/** Realtime with periodic/focus/reconnect catch-up; RLS controls every read. */
export function useCloudData<T>(tables: readonly string[], load: () => Promise<T[]>, enabled = true) {
  const { session, ready } = useCloudAuth();
  const key = enabled ? session?.user.id ?? "" : "";
  const [state, setState] = useState<{ key: string; data: T[]; error: string; loading: boolean; updatedAt: number | null }>({ key: "", data: [], error: "", loading: false, updatedAt: null });
  useEffect(() => {
    if (!cloud || !key || !ready) return;
    let active = true;
    let running = false;
    let queued = false;
    setState({ key, data: [], error: "", loading: true, updatedAt: null });
    const refresh = async () => {
      if (!active) return;
      if (running) { queued = true; return; }
      running = true;
      try {
        if (!navigator.onLine) throw new Error("You are offline. Updates will resume when you reconnect.");
        const data = await load();
        if (active) setState({ key, data, error: "", loading: false, updatedAt: Date.now() });
      } catch (error) {
        if (active) setState((old) => ({ ...old, error: errorMessage(error), loading: false }));
      } finally {
        running = false;
        if (queued && active) { queued = false; void refresh(); }
      }
    };
    const sync = () => { void refresh(); };
    const visibleSync = () => { if (document.visibilityState === "visible") sync(); };
    const channel = cloud.channel(`store-${crypto.randomUUID()}`);
    for (const table of tables) channel.on("postgres_changes", { event: "*", schema: "public", table }, sync);
    channel.subscribe((status) => { if (status === "SUBSCRIBED") sync(); });
    sync();
    const timer = window.setInterval(visibleSync, 15000);
    window.addEventListener(CLOUD_CHANGED, sync);
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    window.addEventListener("focus", visibleSync);
    document.addEventListener("visibilitychange", visibleSync);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener(CLOUD_CHANGED, sync);
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
      window.removeEventListener("focus", visibleSync);
      document.removeEventListener("visibilitychange", visibleSync);
      void cloud?.removeChannel(channel);
    };
  }, [key, ready, tables, load]);
  // Never render data from a previous user's session, even for one frame.
  if (!key || state.key !== key) return { data: [] as T[], error: "", loading: Boolean(key), updatedAt: null };
  return state;
}

/** Fetch all pages rather than silently dropping records past Supabase's row limit. */
export async function readAll<T>(page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const rows: T[] = [];
  const pageSize = 500;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await page(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) return rows;
  }
}
