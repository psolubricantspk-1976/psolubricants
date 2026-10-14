// Runs before Vite builds so accidentally supplied secret keys never reach the bundle.
export function validateCloudConfig(env: Record<string, string | undefined>) {
  const url = env.VITE_SUPABASE_URL?.trim();
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url && !key) return; // Unconfigured builds show an explicit setup notice.
  if (!url || !key) throw new Error("Set both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then rebuild.");
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !parsed.hostname || parsed.username || parsed.password) throw new Error();
  } catch { throw new Error("VITE_SUPABASE_URL must be your HTTPS Supabase project URL."); }
  if (key.startsWith("sb_publishable_")) return;
  if (key.startsWith("sb_secret_")) throw new Error("Never place a Supabase secret key in VITE_ variables. Use the publishable key.");
  try {
    const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString());
    if (payload.role === "anon") return;
  } catch { /* Invalid or privileged JWT key. */ }
  throw new Error("Use a Supabase publishable key or legacy anon key, not a service-role or other secret key.");
}
