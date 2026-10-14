import { cloudConfigured, SETUP_MESSAGE } from "../cloud";

export default function ConnectionNotice({ error = "", loading = false, updatedAt = null }: { error?: string; loading?: boolean; updatedAt?: number | null }) {
  const message = !cloudConfigured ? SETUP_MESSAGE : error || (loading ? "Connecting to the online service…" : updatedAt ? "Synced online · updates automatically" : "");
  if (!message) return null;
  return <p role={error || !cloudConfigured ? "alert" : "status"} className={`my-3 rounded-lg border p-3 text-xs leading-relaxed ${error || !cloudConfigured ? "border-red-400/50 bg-red-50 text-red-800" : "border-emerald-400/40 bg-emerald-50 text-emerald-900"}`}>{message}</p>;
}
