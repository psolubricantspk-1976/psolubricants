import { useRef, useState, type FormEvent } from "react";
import { useCloudAuth } from "../CloudAuth";
import { cloudConfigured, errorMessage, requireCloud } from "../cloud";
import Dashboard from "./Dashboard";
import { Close, Grid, Logo } from "../icons";
import ConnectionNotice from "./ConnectionNotice";
import Captcha, { captchaEnabled } from "./Captcha";

export default function DashboardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { session, isAdmin, ready, roleError } = useCloudAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const sending = useRef(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  if (!open) return null;

  const login = async (event: FormEvent) => {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    setError("");
    try {
      const client = requireCloud();
      const { error: authError } = await client.auth.signInWithPassword({ email: email.trim().toLowerCase(), password, options: { captchaToken } });
      if (authError) throw authError;
      const { data, error: accessError } = await client.rpc("is_admin");
      if (accessError) throw accessError;
      if (data !== true) throw new Error("This account does not have company admin access. Ask the project owner to add it to the admin allowlist.");
      setPassword("");
    } catch (failure) { setError(errorMessage(failure)); }
    finally {
      sending.current = false;
      setBusy(false);
      setCaptchaToken("");
      setCaptchaReset((value) => value + 1);
    }
  };
  const logout = async () => {
    try {
      const { error: failure } = await requireCloud().auth.signOut();
      if (failure) throw failure;
      setPassword("");
    } catch (failure) { setError(errorMessage(failure)); }
  };
  const field = "w-full rounded-lg border border-slate-300 px-3.5 py-3 text-[13.5px] text-[#0b2545] outline-none focus:border-[#009a44]";
  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#0b1f3a]">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#081831] px-5 py-3">
        <div className="flex items-center gap-3"><Logo className="h-10 w-10" /><div>
          <h1 className="font-display text-lg font-extrabold tracking-wide text-white uppercase sm:text-xl">PSO Sales Dashboard</h1>
          <p className="font-mono text-[9px] tracking-[0.2em] text-[#8fb0d6] uppercase">Secure cloud access · Company admin</p>
        </div></div>
        <button onClick={onClose} className="rounded-lg border border-white/20 p-2 text-white/70 hover:bg-white/10" aria-label="Close dashboard"><Close className="h-4 w-4" /></button>
      </header>
      {isAdmin ? (
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-[#0b2545] px-5 py-3">
            <span className="break-all font-mono text-xs text-white">{session?.user.email}</span>
            <button onClick={() => void logout()} className="text-xs text-fog hover:text-white">Sign out</button>
          </div>
          {error && <div className="px-5"><ConnectionNotice error={error} /></div>}
          <Dashboard />
        </div>
      ) : (
        <div className="flex flex-1 items-start justify-center overflow-y-auto bg-[#e8edf4] p-5 sm:items-center">
          <form onSubmit={login} className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
            <div className="flex items-center gap-3"><Grid className="h-8 w-8 text-[#0b2545]" /><h2 className="font-display text-2xl font-extrabold text-[#0b2545] uppercase">Company login</h2></div>
            <ConnectionNotice error={error || roleError} loading={!ready} />
            <label className="mt-5 block text-xs text-slate-600">Company email
              <input required disabled={busy} value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" className={`${field} mt-2`} />
            </label>
            <label className="mt-4 block text-xs text-slate-600">Password
              <input required disabled={busy} value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" className={`${field} mt-2`} />
            </label>
            <Captcha onToken={setCaptchaToken} resetKey={captchaReset} />
            <button type="submit" disabled={!cloudConfigured || busy || !ready || (captchaEnabled && !captchaToken)} className="mt-6 w-full rounded-lg bg-[#009a44] py-3.5 font-display text-sm font-bold text-white uppercase hover:bg-[#007a38] disabled:opacity-50">{busy ? "Signing in…" : "Open sales dashboard"}</button>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">Use your Supabase admin account. Orders and messages sync between signed-in admin devices. The old website password is no longer used.</p>
          </form>
        </div>
      )}
    </div>
  );
}
