import { useState, type FormEvent } from "react";
import { useCustomerAuth } from "../customerAuth";
import { Check, Close, Eye, EyeOff, Logo } from "../icons";
import { cn } from "../utils/cn";

type Mode = "signin" | "signup";

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signUpEmail, loginEmail } = useCustomerAuth();

  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  if (!open) return null;

  const close = () => {
    setName(""); setEmail(""); setPassword("");
    setError(""); setSuccess(null); setShowPw(false);
    onClose();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) throw new Error("Enter a valid email address.");
      if (password.length < 6) throw new Error("Password must be at least 6 characters.");
      if (mode === "signup") {
        if (name.trim().length < 2) throw new Error("Please enter your full name.");
        const c = signUpEmail(name, email, password);
        setSuccess(`Welcome, ${c.name.split(" ")[0]}! Your account is ready.`);
      } else {
        const c = loginEmail(email, password);
        setSuccess(`Welcome back, ${c.name.split(" ")[0]}!`);
      }
      window.setTimeout(close, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const field = "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-[13.5px] text-[#0b2545] outline-none transition-colors placeholder:text-slate-400 focus:border-[#009a44]";
  const label = "mb-1.5 block font-mono text-[10px] tracking-[0.16em] text-slate-500 uppercase";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#04122b]/80 backdrop-blur-sm" onClick={close} aria-hidden="true" />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <div>
              <h1 className="font-display text-lg font-extrabold tracking-wide text-[#0b2545] uppercase">
                {mode === "signup" ? "Create account" : "Customer login"}
              </h1>
              <p className="font-mono text-[9px] tracking-[0.24em] text-slate-400 uppercase">PSO Lubricants · Pakistan</p>
            </div>
          </div>
          <button onClick={close} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50" aria-label="Close">
            <Close className="h-4 w-4" />
          </button>
        </div>

        {/* tabs */}
        <div className="grid grid-cols-2 border-b border-slate-200">
          {(["signin", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={cn(
                "relative py-3 font-mono text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors",
                mode === m ? "text-[#0b2545]" : "text-slate-400 hover:text-slate-600",
              )}
            >
              {m === "signin" ? "Sign in" : "Sign up"}
              <span className={cn("absolute inset-x-0 -bottom-px h-0.5 bg-[#009a44] transition-transform", mode === m ? "scale-x-100" : "scale-x-0")} />
            </button>
          ))}
        </div>

        <div className="px-5 py-6">
          {success ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#009a44]/15 text-[#009a44]"><Check className="h-7 w-7" /></span>
              <p className="mt-4 font-display text-lg font-bold text-[#0b2545]">{success}</p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-4">
              {mode === "signup" && (
                <label className="block">
                  <span className={label}>Full name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmed Khan" className={field} />
                </label>
              )}
              <label className="block">
                <span className={label}>Email address</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={field} />
              </label>
              <label className="block">
                <span className={label}>Password {mode === "signup" && "(min 6 characters)"}</span>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={cn(field, "pr-10")} />
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={showPw ? "Hide password" : "Show password"}>
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
              {error && <p className="font-mono text-[11px] text-[#d64545]">{error}</p>}
              <button type="submit" className="shine w-full rounded-lg bg-[#009a44] py-3.5 font-display text-[13.5px] font-bold tracking-[0.12em] text-white uppercase transition-colors hover:bg-[#007a38]">
                {mode === "signup" ? "Create account" : "Sign in"}
              </button>
              <p className="text-center font-mono text-[11.5px] text-slate-500">
                {mode === "signup" ? "Already have an account?" : "New to PSO Lubricants?"}{" "}
                <button type="button" onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); }} className="font-semibold text-[#009a44] hover:underline">
                  {mode === "signup" ? "Sign in" : "Sign up"}
                </button>
              </p>
              <p className="text-center font-mono text-[10px] text-slate-400">By continuing you agree to our Terms & Privacy Policy.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
