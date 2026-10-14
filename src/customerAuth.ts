import { useCloudAuth } from "./CloudAuth";
import { notifyCloudChanged, requireCloud } from "./cloud";
import { readAll, useCloudData } from "./useCloudData";

export type AuthProvider = "email";
export type Customer = {
  id: string; name: string; email: string; phone?: string; address?: string;
  city?: string; provider: AuthProvider; avatar?: string; createdAt: string;
};
type ProfileRow = { id: string; name: string; email: string; phone: string; address: string; city: string; created_at: string };
const TABLES = ["customer_profiles"];
const toCustomer = (row: ProfileRow): Customer => ({ ...row, provider: "email", createdAt: row.created_at });
async function loadProfiles() {
  const client = requireCloud();
  return (await readAll<ProfileRow>((from, to) => client.from("customer_profiles").select("id,name,email,phone,address,city,created_at").order("created_at", { ascending: false }).order("id").range(from, to))).map(toCustomer);
}
export function useAccounts(enabled = true) {
  const { data: accounts, ...sync } = useCloudData(TABLES, loadProfiles, enabled);
  return { accounts, ...sync };
}
export function useCustomerAuth() {
  const { session } = useCloudAuth();
  const user = session?.user;
  // Profile reads are owner-only unless the session is an administrator.
  const { accounts } = useAccounts(Boolean(user && !user.is_anonymous));
  const customer = user && !user.is_anonymous ? accounts.find((p) => p.id === user.id) ?? {
    id: user.id, name: String(user.user_metadata.name || user.email?.split("@")[0] || "Customer"),
    email: user.email ?? "", provider: "email" as const, createdAt: user.created_at,
  } : null;
  const signUpEmail = async (name: string, email: string, password: string, captchaToken?: string) => {
    const client = requireCloud();
    const { data: current } = await client.auth.getSession();
    // Upgrade a guest identity so orders and conversations keep their owner.
    if (current.session?.user.is_anonymous) {
      const { data, error } = await client.auth.updateUser({ email: email.trim().toLowerCase(), password, data: { name: name.trim() } }, { emailRedirectTo: window.location.origin });
      if (error) throw error;
      return { name: name.trim(), needsConfirmation: !data.user?.email_confirmed_at };
    }
    const { data, error } = await client.auth.signUp({ email: email.trim().toLowerCase(), password,
      options: { data: { name: name.trim() }, captchaToken, emailRedirectTo: window.location.origin } });
    if (error) throw error;
    return { name: name.trim(), needsConfirmation: !data.session };
  };
  const loginEmail = async (email: string, password: string, captchaToken?: string) => {
    const { data, error } = await requireCloud().auth.signInWithPassword({ email: email.trim().toLowerCase(), password, options: { captchaToken } });
    if (error) throw error;
    return { name: String(data.user.user_metadata.name || data.user.email?.split("@")[0] || "Customer") };
  };
  const updateProfile = async (patch: Pick<Customer, "phone" | "address" | "city">) => {
    if (!customer) return;
    const { error } = await requireCloud().from("customer_profiles").update(patch).eq("id", customer.id);
    if (error) throw error;
    notifyCloudChanged();
  };
  const logout = async () => {
    const { error } = await requireCloud().auth.signOut();
    if (error) throw error;
  };
  return { customer, signUpEmail, loginEmail, updateProfile, logout };
}
