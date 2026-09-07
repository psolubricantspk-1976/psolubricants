import { useEffect, useState } from "react";
import { TRACKING_STATUSES, DECLINED_STATUS } from "../data";
import { readOrders, searchOrders, formatMoney, type Order } from "../orders";
import { waLink } from "../whatsapp";
import { Check, Close, Logo, WhatsApp } from "../icons";
import { cn } from "../utils/cn";

export default function TrackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [recent, setRecent] = useState<Order[]>([]);

  // fresh read from storage every time the modal opens, so codes created moments ago work
  useEffect(() => {
    if (open) {
      setRecent(readOrders().slice(0, 3));
      setSearched(false);
    }
  }, [open]);

  if (!open) return null;

  const order = searched ? searchOrders(readOrders(), query) : null;
  const declined = order?.status === "declined";
  const steps = declined ? null : TRACKING_STATUSES;
  const currentIdx = order && steps ? steps.findIndex((s) => s.id === order.status) : -1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#04122b]/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <div>
              <h1 className="font-display text-xl font-extrabold tracking-wide text-[#0b2545] uppercase">Track your order</h1>
              <p className="font-mono text-[9px] tracking-[0.28em] text-slate-400 uppercase">Live dispatch update from Khanewal</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50" aria-label="Close">
            <Close className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-6 sm:px-7">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] tracking-[0.16em] text-slate-500 uppercase">Order number or tracking code</span>
            <div className="flex gap-2.5">
              <input
                autoFocus
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearched(false); }}
                onKeyDown={(e) => { if (e.key === "Enter" && query.trim()) setSearched(true); }}
                placeholder="Paste the code from your order confirmation"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-3 font-mono text-[13.5px] tracking-wide text-[#0b2545] uppercase outline-none transition-colors placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-[#009a44]"
              />
              <button
                onClick={() => setSearched(true)}
                disabled={query.trim().length < 5}
                className="shrink-0 rounded-lg bg-[#009a44] px-6 font-display text-[13px] font-bold tracking-[0.14em] text-white uppercase transition-colors hover:bg-[#007a38] disabled:opacity-40"
              >
                Track
              </button>
            </div>
          </label>
          <p className="mt-2 font-mono text-[10.5px] text-slate-400">
            Tip: spaces, dashes and small/capital letters don't matter — paste it exactly as you received it.
          </p>

          {/* recent orders placed on this device — one tap to track */}
          {recent.length > 0 && !searched && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-mono text-[10px] tracking-[0.18em] text-slate-500 uppercase">Your recent orders on this device</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {recent.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => { setQuery(o.tracking); setSearched(true); }}
                    className="rounded-full border border-[#009a44]/40 bg-white px-3.5 py-1.5 font-mono text-[11px] text-[#009a44] transition-colors hover:bg-[#009a44] hover:text-white"
                  >
                    {o.tracking}
                  </button>
                ))}
              </div>
            </div>
          )}

          {searched && !order && (
            <div className="mt-5 rounded-xl border border-[#d64545]/40 bg-[#d64545]/5 p-4 font-mono text-[12px] leading-relaxed text-[#a13232]">
              No dispatch found for “{query}”. Double-check the code on your order confirmation (it looks like
              <span className="font-bold"> PSO-2026-12345678</span> or <span className="font-bold">K7M2P9Q4XW3N</span>),
              or WhatsApp us at 03077885585 and we'll look it up for you.
            </div>
          )}

          {order && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-[11px] text-slate-500">{order.id}</span>
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="font-mono text-[11px] font-semibold text-[#009a44]">{order.tracking}</span>
                </div>
                <span className={cn(
                  "rounded-full px-3 py-1 font-mono text-[10.5px] font-semibold uppercase",
                  declined ? "bg-[#d64545]/10 text-[#a13232]" : "bg-[#009a44]/10 text-[#009a44]",
                )}>
                  {declined ? DECLINED_STATUS.label : TRACKING_STATUSES[currentIdx]?.label}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-slate-500">
                <span>{order.productName} × {order.qty}</span>
                <span>{order.city}</span>
                <span>{formatMoney(order.total)}</span>
              </div>

              {declined ? (
                <p className="mt-5 rounded-lg border border-[#d64545]/40 bg-white p-4 font-mono text-[12px] leading-relaxed text-[#a13232]">
                  This order was declined because the payment was not received in our Easypaisa / JazzCash account.
                  If you did send the transfer, WhatsApp your transaction ID to 03077885585 and we will verify and reactivate it.
                </p>
              ) : (
                <ol className="mt-6 space-y-0">
                  {TRACKING_STATUSES.map((s, i) => {
                    const done = i < currentIdx || order.status === "delivered";
                    const active = i === currentIdx && order.status !== "delivered";
                    return (
                      <li key={s.id} className="relative flex gap-3 pb-5 last:pb-0">
                        {i < TRACKING_STATUSES.length - 1 && (
                          <span className={cn("absolute top-5 left-[9px] h-full w-0.5", i < currentIdx ? "bg-[#009a44]" : "bg-slate-200")} />
                        )}
                        <span className={cn(
                          "relative z-10 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border-2",
                          done ? "border-[#009a44] bg-[#009a44] text-white" : active ? "border-[#009a44] bg-white" : "border-slate-300 bg-white",
                        )}>
                          {done ? <Check className="h-2.5 w-2.5" /> : active ? <span className="h-2 w-2 rounded-full bg-[#009a44]" /> : null}
                        </span>
                        <span className={cn("pt-0.5 font-mono text-[12px]", done || active ? "text-[#0b2545]" : "text-slate-400")}>
                          {s.label}
                          {active && <span className="ml-2 font-mono text-[10px] text-[#009a44] uppercase">· current</span>}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}

              <a
                href={waLink(`Hi PSO — status update for order ${order.id} (${order.tracking}) please.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center gap-2 font-mono text-[11.5px] font-semibold text-[#009a44] hover:underline"
              >
                <WhatsApp className="h-4 w-4" /> Need a faster update? WhatsApp 03077885585
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
