import { useEffect, useState } from "react";
import { PRODUCTS, DELIVERY_ZONES } from "../data";
import { useOrders, formatMoney, getDeliveryFee, PAYMENT_METHODS, RECEIVING_NUMBER, type PaymentMethod } from "../orders";
import { useCustomerAuth } from "../customerAuth";
import { waLink } from "../whatsapp";
import { Box, Check, Close, Copy, Logo, Trash, WhatsApp } from "../icons";
import { cn } from "../utils/cn";

export type CartItem = { productId: string; qty: number };

type Result = { id: string; tracking: string; total: number };

export default function OrderModal({
  open,
  items,
  onClose,
  onUpdateQty,
  onRemove,
  onClear,
  onOrderPlaced,
}: {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onOrderPlaced: () => void;
}) {
  const { addOrder } = useOrders();
  const { customer, updateProfile } = useCustomerAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [zone, setZone] = useState("spunjab");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("easypaisa");
  const [txId, setTxId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  // prefill from the logged-in customer profile
  useEffect(() => {
    if (open && customer) {
      setName((n) => n || customer.name);
      setEmail((e) => e || customer.email);
      setPhone((p) => p || customer.phone || "");
      setCity((c) => c || customer.city || "");
      setAddress((a) => a || customer.address || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const subtotal = items.reduce((s, it) => {
    const p = PRODUCTS.find((x) => x.id === it.productId);
    return s + (p ? p.price * it.qty : 0);
  }, 0);
  const deliveryFee = getDeliveryFee(zone);
  const total = subtotal + deliveryFee;
  const itemCount = items.reduce((s, it) => s + it.qty, 0);

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(RECEIVING_NUMBER);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const reset = () => {
    setName(""); setPhone(""); setEmail(""); setCity(""); setAddress("");
    setNotes(""); setTxId(""); setMethod("easypaisa"); setErrors({}); setResult(null);
    setZone("spunjab");
  };

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Required";
    if (!/^\d{10,14}$/.test(phone.replace(/\D/g, ""))) next.phone = "Required";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = "Invalid email";
    if (!city.trim()) next.city = "Required";
    if (address.trim().length < 8) next.address = "Required";
    if (method !== "cod" && !txId.trim()) next.txId = "Required";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const created: { id: string; tracking: string }[] = [];
    items.forEach((it) => {
      const p = PRODUCTS.find((x) => x.id === it.productId);
      if (!p) return;
      const o = addOrder({
        productId: p.id,
        productName: p.name,
        grade: p.grade,
        qty: it.qty,
        unitPrice: p.price,
        deliveryFee,
        total: p.price * it.qty + deliveryFee / Math.max(1, items.length),
        customer: name,
        phone,
        email,
        address,
        city,
        zone,
        method,
        accountLabel: "",
        accountNumber: "",
        transactionId: txId,
        notes,
      });
      created.push(o);
    });
    if (created.length) setResult({ id: created[0].id, tracking: created[0].tracking, total });
    if (customer) updateProfile({ phone, address, city });
    onOrderPlaced();
  };

  if (!open) return null;

  const inputCls = (err?: string) =>
    cn(
      "w-full rounded-lg border bg-white px-3.5 py-2.5 text-[13.5px] text-[#0b2545] outline-none transition-colors placeholder:text-slate-400",
      err ? "border-[#d64545]" : "border-slate-300 focus:border-[#009a44]",
    );
  const labelCls = "mb-1.5 block font-mono text-[10px] tracking-[0.16em] text-slate-500 uppercase";

  const txLabel = method === "jazzcash" ? "JazzCash transaction ID *" : "Easypaisa transaction ID *";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-[#04122b]/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5 sm:px-7">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <div>
              <h1 className="font-display text-lg font-extrabold tracking-wide text-[#0b2545] uppercase">Secure order</h1>
              <p className="font-mono text-[9px] tracking-[0.28em] text-slate-400 uppercase">PSO Lubricants · Pakistan</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50" aria-label="Close">
            <Close className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto">
          {result ? (
            /* ---------- success ---------- */
            <div className="px-6 py-14 text-center sm:px-10">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#009a44]/15 text-[#009a44]">
                <Check className="h-8 w-8" />
              </span>
              <h2 className="font-display mt-5 text-3xl font-extrabold tracking-wide text-[#0b2545] uppercase">Order placed</h2>
              <p className="mt-2 text-[13px] text-slate-500">Keep these codes — you'll need them to track your dispatch from Khanewal.</p>
              <div className="mx-auto mt-7 grid max-w-md gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                  <p className="font-mono text-[9.5px] tracking-[0.2em] text-slate-500 uppercase">Order number</p>
                  <p className="mt-1 font-mono text-[14px] font-semibold text-[#0b2545]">{result.id}</p>
                </div>
                <div className="rounded-xl border border-[#009a44]/40 bg-[#009a44]/5 p-4 text-left">
                  <p className="font-mono text-[9.5px] tracking-[0.2em] text-[#009a44] uppercase">Tracking code</p>
                  <p className="mt-1 font-mono text-[14px] font-semibold text-[#0b2545]">{result.tracking}</p>
                </div>
              </div>
              {method === "cod" ? (
                <p className="mt-5 rounded-xl bg-slate-50 p-3 font-mono text-[11.5px] text-slate-600">
                  Pay <span className="font-bold text-[#0b2545]">{formatMoney(result.total)}</span> in cash at your door on delivery.
                </p>
              ) : (
                <p className="mt-5 rounded-xl bg-[#009a44]/5 p-3 font-mono text-[11.5px] text-slate-600">
                  Send <span className="font-bold text-[#0b2545]">{formatMoney(result.total)}</span> to <span className="font-bold text-[#009a44]">{RECEIVING_NUMBER}</span> and note the tracking code in the remark. We'll verify and dispatch.
                </p>
              )}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={waLink(`Hi PSO Lubricants — new order ${result.id}\nTracking: ${result.tracking}\nTotal: Rs. ${result.total.toLocaleString()}\nCustomer: ${name} (${phone})\nPlease confirm and dispatch.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full bg-[#009a44] px-6 py-3 font-display text-[13px] font-bold tracking-wide text-white uppercase transition-transform hover:scale-105"
                >
                  <WhatsApp className="h-4 w-4" /> Confirm on WhatsApp
                </a>
                <button onClick={() => { reset(); onClose(); }} className="rounded-full border border-slate-300 px-6 py-3 font-mono text-[12px] text-slate-600 transition-colors hover:border-[#0b2545] hover:text-[#0b2545]">
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* ---------- form ---------- */
            <form onSubmit={placeOrder} noValidate>
              <div className="grid gap-8 px-5 py-6 sm:px-7 lg:grid-cols-[0.9fr_1.1fr]">
                {/* left: your order */}
                <div>
                  <div className="flex items-baseline justify-between">
                    <h2 className="font-display text-xl font-extrabold tracking-wide text-[#0b2545] uppercase">Your order</h2>
                    <span className="font-mono text-[11px] text-slate-400">{itemCount} item{itemCount === 1 ? "" : "s"}</span>
                  </div>
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    {items.length === 0 ? (
                      <p className="py-8 text-center font-mono text-[12px] text-slate-400">Your cart is empty.</p>
                    ) : (
                      <ul className="space-y-4">
                        {items.map((it) => {
                          const p = PRODUCTS.find((x) => x.id === it.productId);
                          if (!p) return null;
                          return (
                            <li key={it.productId}>
                              <div className="flex items-center gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#0b2545] text-white">
                                  <Box className="h-5 w-5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <span className="block truncate font-display text-[14px] font-bold text-[#0b2545]">{p.name}</span>
                                  <span className="font-mono text-[11px] text-slate-500">{p.pack} · {formatMoney(p.price)} each</span>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center justify-between pl-14">
                                <div className="flex items-center gap-2">
                                  <button type="button" onClick={() => onUpdateQty(it.productId, Math.max(1, it.qty - 1))} className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:border-[#0b2545]">−</button>
                                  <span className="w-6 text-center font-mono text-[13px] text-[#0b2545]">{it.qty}</span>
                                  <button type="button" onClick={() => onUpdateQty(it.productId, it.qty + 1)} className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:border-[#0b2545]">+</button>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-[13px] font-semibold text-[#0b2545]">{formatMoney(p.price * it.qty)}</span>
                                  <button type="button" onClick={() => onRemove(it.productId)} className="text-slate-400 transition-colors hover:text-[#d64545]" aria-label={`Remove ${p.name}`}>
                                    <Trash className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                  <dl className="mt-5 space-y-2 border-t border-slate-200 pt-4 font-mono text-[12.5px]">
                    <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="text-[#0b2545]">{formatMoney(subtotal)}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">Delivery from Khanewal</dt><dd className="text-[#0b2545]">{deliveryFee === 0 ? "Free" : formatMoney(deliveryFee)}</dd></div>
                    <div className="flex justify-between border-t border-slate-200 pt-2"><dt className="font-semibold text-[#0b2545]">Total</dt><dd className="font-display text-lg font-extrabold text-[#0b2545]">{formatMoney(total)}</dd></div>
                  </dl>
                  {items.length > 1 && (
                    <button type="button" onClick={onClear} className="mt-3 font-mono text-[10.5px] text-slate-400 hover:text-[#d64545]">Clear cart</button>
                  )}
                </div>

                {/* right: delivery + payment */}
                <div>
                  <h2 className="font-display text-xl font-extrabold tracking-wide text-[#0b2545] uppercase">Delivery details</h2>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className={labelCls}>Full name *</span>
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className={inputCls(errors.name)} />
                      {errors.name && <span className="mt-1 block font-mono text-[10px] text-[#d64545]">{errors.name}</span>}
                    </label>
                    <label className="block">
                      <span className={labelCls}>Mobile number *</span>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03XXXXXXXXX" className={inputCls(errors.phone)} />
                      {errors.phone && <span className="mt-1 block font-mono text-[10px] text-[#d64545]">{errors.phone}</span>}
                    </label>
                    <label className="block">
                      <span className={labelCls}>Email (optional)</span>
                      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={inputCls(errors.email)} />
                      {errors.email && <span className="mt-1 block font-mono text-[10px] text-[#d64545]">{errors.email}</span>}
                    </label>
                    <label className="block">
                      <span className={labelCls}>City *</span>
                      <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Karachi" className={inputCls(errors.city)} />
                      {errors.city && <span className="mt-1 block font-mono text-[10px] text-[#d64545]">{errors.city}</span>}
                    </label>
                  </div>
                  <label className="mt-4 block">
                    <span className={labelCls}>Delivery region *</span>
                    <select value={zone} onChange={(e) => setZone(e.target.value)} className={inputCls()}>
                      {DELIVERY_ZONES.map((z) => (
                        <option key={z.id} value={z.id}>{z.label} · {z.days} days</option>
                      ))}
                    </select>
                  </label>
                  <p className="mt-2 font-mono text-[10.5px] leading-relaxed text-slate-500">
                    Estimated {getDeliveryDaysLabel(zone)} working days. Heavy pallets, drums and IBCs include freight surcharges.
                  </p>
                  <label className="mt-4 block">
                    <span className={labelCls}>Complete delivery address *</span>
                    <textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House, street, area and nearby landmark" className={cn(inputCls(errors.address), "resize-none")} />
                    {errors.address && <span className="mt-1 block font-mono text-[10px] text-[#d64545]">{errors.address}</span>}
                  </label>
                  <label className="mt-4 block">
                    <span className={labelCls}>Order notes</span>
                    <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery timing or vehicle details" className={inputCls()} />
                  </label>

                  {/* payment */}
                  <h2 className="font-display mt-7 text-xl font-extrabold tracking-wide text-[#0b2545] uppercase">Payment</h2>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        disabled={m.disabled}
                        onClick={() => setMethod(m.id)}
                        className={cn(
                          "rounded-xl border p-3.5 text-left transition-all",
                          m.disabled
                            ? "cursor-not-allowed border-slate-200 opacity-50"
                            : method === m.id
                              ? "border-[#009a44] bg-[#009a44]/5 ring-1 ring-[#009a44]"
                              : "border-slate-200 hover:border-slate-300",
                        )}
                      >
                        <span className={cn("block text-[14px] font-bold", method === m.id && !m.disabled ? "text-[#009a44]" : "text-[#0b2545]")}>{m.label}</span>
                        <span className="mt-0.5 block font-mono text-[10.5px] text-slate-400">{m.sub}</span>
                      </button>
                    ))}
                  </div>

                  {method !== "cod" && (
                    <div className="mt-4 rounded-xl border border-[#009a44]/40 bg-[#009a44]/5 p-4">
                      <p className="font-mono text-[10px] font-semibold tracking-[0.22em] text-[#009a44] uppercase">Transfer exact total to</p>
                      <div className="mt-2.5 flex items-center justify-between rounded-lg border border-[#009a44]/30 bg-white px-4 py-3">
                        <div>
                          <p className="font-mono text-2xl font-extrabold tracking-wide text-[#0b2545]">{RECEIVING_NUMBER}</p>
                          <p className="font-mono text-[10px] text-slate-400">{method === "jazzcash" ? "JazzCash receiving account" : "Easypaisa receiving account"}</p>
                        </div>
                        <button type="button" onClick={copyNumber} className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 font-mono text-[10.5px] text-slate-600 transition-colors hover:border-[#009a44] hover:text-[#009a44]">
                          <Copy className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <p className="mt-3 text-[12.5px] leading-relaxed text-slate-600">
                        Send <span className="font-bold text-[#0b2545]">{formatMoney(total)}</span> in your {method === "jazzcash" ? "JazzCash" : "EasyPaisa"} app, then enter the transaction ID below. The company will verify it before dispatch.
                      </p>
                      <label className="mt-3 block">
                        <span className={labelCls}>{txLabel}</span>
                        <input value={txId} onChange={(e) => setTxId(e.target.value)} placeholder="e.g. 2468013579" className={inputCls(errors.txId)} />
                        {errors.txId && <span className="mt-1 block font-mono text-[10px] text-[#d64545]">{errors.txId}</span>}
                      </label>
                    </div>
                  )}
                  {method === "cod" && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-[11.5px] text-slate-600">
                      Pay <span className="font-bold text-[#0b2545]">{formatMoney(total)}</span> in cash at your door on delivery.
                    </div>
                  )}

                  <p className="mt-4 rounded-lg bg-slate-100 p-3 font-mono text-[10.5px] leading-relaxed text-slate-500">
                    Never enter a bank password, wallet PIN, card number or OTP on this website. Payment is completed only inside the official wallet application.
                  </p>
                  <a
                    href={waLink("Hi PSO Lubricants, I need help placing my order.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[#009a44] px-4 py-2.5 font-mono text-[11.5px] font-semibold text-[#009a44] transition-colors hover:bg-[#009a44]/5"
                  >
                    <WhatsApp className="h-4 w-4" />
                    Need help? WhatsApp 03077885585
                  </a>
                </div>
              </div>

              <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
                <button
                  type="submit"
                  disabled={items.length === 0}
                  className="w-full rounded-full bg-[#009a44] py-3.5 font-display text-[14px] font-bold tracking-wide text-white uppercase transition-colors hover:bg-[#007a38] disabled:opacity-40"
                >
                  Place order · {formatMoney(total)}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function getDeliveryDaysLabel(zoneId: string) {
  const z = DELIVERY_ZONES.find((x) => x.id === zoneId);
  return z ? z.days : "3-5";
}
