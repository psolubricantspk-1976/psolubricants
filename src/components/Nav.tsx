import { useState } from "react";
import { scrollToId, useActiveSection, useScrolled } from "../hooks";
import { Arrow, Box, Cart, Grid, Logo, Phone, User } from "../icons";
import { useCustomerAuth } from "../customerAuth";
import { cn } from "../utils/cn";

const LINKS = [
  { id: "top", label: "Home" },
  { id: "products", label: "Products" },
  { id: "finder", label: "Oil Finder" },
  { id: "why", label: "Quality" },
  { id: "contact", label: "Contact" },
];

export default function Nav({
  cartCount,
  onOpenCart,
  onTrack,
  onDashboard,
  onAccount,
}: {
  cartCount: number;
  onOpenCart: () => void;
  onTrack: () => void;
  onDashboard: () => void;
  onAccount: () => void;
}) {
  const scrolled = useScrolled(10);
  const active = useActiveSection(LINKS.map((l) => l.id));
  const [open, setOpen] = useState(false);
  const [accountMenu, setAccountMenu] = useState(false);
  const { customer, logout } = useCustomerAuth();

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-40 border-b transition-all duration-300",
        scrolled ? "border-line bg-coal/92 backdrop-blur-md" : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <button onClick={() => go("top")} className="group flex items-center gap-2.5 text-left" aria-label="PSO Lubricants — back to top">
          <Logo className="h-9 w-9" />
          <span className="font-display text-lg font-extrabold tracking-wide text-oil uppercase">
            PSO <span className="text-moss">Lubricants</span>
          </span>
        </button>

        <div className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className={cn(
                "relative font-mono text-[12.5px] tracking-wide transition-colors",
                active === l.id ? "text-oil" : "text-fog2 hover:text-paper",
              )}
            >
              {l.label}
              <span className={cn("absolute -bottom-1.5 inset-x-0 h-0.5 bg-oil transition-transform duration-300", active === l.id ? "scale-x-100" : "scale-x-0")} />
            </button>
          ))}
        </div>

        {/* tools bar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onTrack}
            className="hidden items-center gap-1.5 rounded-full border border-line px-3.5 py-2 font-mono text-[11px] text-fog2 transition-colors hover:border-oil hover:text-oil sm:flex"
          >
            <Box className="h-3.5 w-3.5" /> Track
          </button>
          <button
            onClick={onDashboard}
            aria-label="Dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-fog2 transition-colors hover:border-oil hover:text-oil"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenCart}
            aria-label="Cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line text-fog2 transition-colors hover:border-oil hover:text-oil"
          >
            <Cart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-oil px-1 font-mono text-[9px] font-bold text-paper">{cartCount}</span>
            )}
          </button>
          <a
            href="tel:03077885585"
            className="shine group hidden items-center gap-2 rounded-full bg-oil px-5 py-2.5 font-display text-[13px] font-bold tracking-wide text-paper uppercase transition-all hover:bg-paper hover:text-ink sm:flex"
          >
            <Phone className="h-3.5 w-3.5" />
            Find a Dealer
          </a>

          {/* account */}
          <div className="relative">
            {customer ? (
              <button
                onClick={() => setAccountMenu((m) => !m)}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-moss/60 bg-moss/10 text-moss transition-colors hover:border-moss"
                aria-label="Account menu"
              >
                {customer.avatar ? (
                  <img src={customer.avatar} alt={customer.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="font-mono text-[11px] font-bold">{customer.name[0]?.toUpperCase()}</span>
                )}
              </button>
            ) : (
              <button
                onClick={onAccount}
                aria-label="Sign up or log in"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-fog2 transition-colors hover:border-oil hover:text-oil"
              >
                <User className="h-4 w-4" />
              </button>
            )}

            {accountMenu && customer && (
              <div className="absolute top-11 right-0 w-56 rounded-xl border border-line bg-panel p-3 shadow-2xl shadow-black/40">
                <p className="truncate font-display text-[13px] font-bold text-paper">{customer.name}</p>
                <p className="truncate font-mono text-[10.5px] text-fog">{customer.email}</p>
                <span className="mt-1.5 inline-block rounded-full bg-moss/15 px-2 py-0.5 font-mono text-[9px] tracking-wider text-moss uppercase">
                  via {customer.provider}
                </span>
                <button
                  onClick={() => { logout(); setAccountMenu(false); }}
                  className="mt-3 w-full rounded-full border border-line py-2 font-mono text-[11px] text-fog2 transition-colors hover:border-rust hover:text-rust"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-full border border-line p-2 text-fog2 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <Arrow className="h-5 w-5 rotate-45" /> : <Phone className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-coal/95 backdrop-blur-md lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-1 px-5 py-4">
            {LINKS.map((l) => (
              <button key={l.id} onClick={() => go(l.id)} className="rounded-full px-3 py-2.5 text-left font-mono text-[13px] text-fog2 hover:bg-steel2 hover:text-oil">
                {l.label}
              </button>
            ))}
            <a href="tel:03077885585" className="mt-2 flex items-center gap-2 rounded-full bg-oil px-4 py-2.5 font-display text-[13px] font-bold tracking-wide text-paper uppercase">
              <Phone className="h-3.5 w-3.5" /> 03077885585
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
