import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
export const cloudConfigured = Boolean(url && /^https:\/\//.test(url) && key);
export const cloud = cloudConfigured ? createClient(url!, key!, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  global: {
    fetch: async (input, init) => {
      const controller = new AbortController();
      const abort = () => controller.abort();
      const timer = setTimeout(abort, 20000);
      init?.signal?.addEventListener("abort", abort, { once: true });
      if (init?.signal?.aborted) abort();
      try { return await fetch(input, { ...init, signal: controller.signal }); }
      finally {
        clearTimeout(timer);
        init?.signal?.removeEventListener("abort", abort);
      }
    },
  },
}) : null;

export const SETUP_MESSAGE = "Online orders and chat are not connected yet. Please contact us on WhatsApp or phone while setup is completed.";
export function requireCloud() {
  if (!cloud) throw new Error(SETUP_MESSAGE);
  if (!navigator.onLine) throw new Error("You are offline. Reconnect and try again; your submission has not been confirmed.");
  return cloud;
}

let connecting: Promise<void> | null = null;
/** Guests get a real anonymous Auth identity, not public access to everyone's data. */
export async function ensureSession(captchaToken?: string) {
  const client = requireCloud();
  if (!connecting) {
    connecting = (async () => {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (!data.session) {
        const { error: signInError } = await client.auth.signInAnonymously({ options: { captchaToken } });
        if (signInError) throw signInError;
      }
    })().finally(() => { connecting = null; });
  }
  await connecting;
  return client;
}

export function errorMessage(error: unknown): string {
  if (!navigator.onLine) return "You are offline. Reconnect and try again.";
  if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
    return "The connection timed out. Please retry to confirm your submission; retries won't create duplicate orders.";
  }
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    const message = error.message;
    if (/failed to fetch|network|load failed/i.test(message)) return "Cannot reach the online service. Check your connection and retry.";
    if (/schema cache|does not exist|permission denied/i.test(message)) return "The online service needs configuration. Please contact us on WhatsApp or phone.";
    return message;
  }
  return "Something went wrong. Please try again.";
}

/** Stable retry IDs survive a page refresh; only a hash, never customer details, is stored. */
async function requestKey(scope: string, payload: unknown): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(payload)));
  const fingerprint = Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `pso-request-${scope}-${fingerprint}`;
}
export async function requestId(scope: string, payload: unknown): Promise<string> {
  const storageKey = await requestKey(scope, payload);
  try {
    const existing = sessionStorage.getItem(storageKey);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(storageKey, id);
    return id;
  } catch {
    // Blocked browser storage: retain retry IDs in memory for this page.
    if (!retryIds.has(storageKey)) retryIds.set(storageKey, crypto.randomUUID());
    return retryIds.get(storageKey)!;
  }
}
const retryIds = new Map<string, string>();

export const CLOUD_CHANGED = "pso-cloud-changed";
export function notifyCloudChanged() { window.dispatchEvent(new Event(CLOUD_CHANGED)); }

export async function completeRequest(scope: string, payload: unknown) {
  const key = await requestKey(scope, payload);
  retryIds.delete(key);
  try { sessionStorage.removeItem(key); } catch { /* Storage may be disabled. */ }
}
