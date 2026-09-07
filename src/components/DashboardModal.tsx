import { useState, type FormEvent } from "react";
import { useOrders } from "../orders";
import Dashboard from "./Dashboard";
import { Close, Grid, Logo } from "../icons";

const EMAIL = "psolubricants.pk@gmail.com";
const PASSWORD = "qasim084&";

export default function DashboardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [user, setUser] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { orders } = useOrders();

  if (!open) return null;

  const login = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() === EMAIL && password === PASSWORD) {
      setUser(true);
      setError("");
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#0b1f3a]">
      {/* top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#081831] px-5 py-3">
        <div className="flex items-center gap-3">
          <Logo className="h-10 w-10" />
          <div>
            <h1 className="font-display text-lg font-extrabold tracking-wide text-white uppercase sm:text-xl">PSO Sales Dashboard</h1>
            <p className="font-mono text-[9px] tracking-[0.28em] text-[#8fb0d6] uppercase">Netlify Identity · Private company access</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg border border-white/20 p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close dashboard"
        >
          <Close className="h-4 w-4" />
        </button>
      </header>

      {user ? (
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-line bg-[#0b2545] px-5 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#009a44] font-mono text-[10px] font-bold text-white">
                {EMAIL[0].toUpperCase()}
              </span>
              <span className="font-mono text-[11.5px] text-white">{EMAIL}</span>
              <span className="rounded-full bg-[#009a44]/20 px-2 py-0.5 font-mono text-[9px] tracking-wider text-[#5fdd9c] uppercase">company.admin</span>
            </div>
            <button
              onClick={() => { setUser(false); setPassword(""); }}
              className="font-mono text-[11px] text-[#8fb0d6] transition-colors hover:text-white"
            >
              Sign out
            </button>
          </div>
          <Dashboard />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center overflow-y-auto bg-[#e8edf4] p-5">
          <form onSubmit={login} className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b2545] text-white">
                <Grid className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-wide text-[#0b2545] uppercase">Company login</h2>
                <p className="font-mono text-[10px] tracking-[0.22em] text-slate-400 uppercase">Single authorized email</p>
              </div>
            </div>

            <label className="mt-7 block">
              <span className="mb-1.5 block font-mono text-[10px] tracking-[0.16em] text-slate-500 uppercase">Company email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter company email"
                autoComplete="username"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-[13.5px] text-[#0b2545] outline-none transition-colors placeholder:text-slate-400 focus:border-[#009a44]"
              />
            </label>
            <label className="mt-4 block">
              <span className="mb-1.5 block font-mono text-[10px] tracking-[0.16em] text-slate-500 uppercase">Secure password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-[13.5px] text-[#0b2545] outline-none transition-colors focus:border-[#009a44]"
              />
            </label>
            {error && <p className="mt-3 font-mono text-[11px] text-[#d64545]">{error}</p>}
            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-[#009a44] py-3.5 font-display text-[14px] font-bold tracking-[0.12em] text-white uppercase transition-colors hover:bg-[#007a38]"
            >
              Open sales dashboard
            </button>
            <p className="mt-4 text-center font-mono text-[10px] text-slate-400">
              {orders.length} order(s) stored on this device
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
