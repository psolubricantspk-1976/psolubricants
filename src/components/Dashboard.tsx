import { useMemo, useState } from "react";
import { useOrders, formatMoney, type Order } from "../orders";
import { useCustomerMessages } from "../messages";
import { getAllAccounts } from "../customerAuth";
import { DELIVERY_ZONES } from "../data";
import { gmailComposeLink } from "../gmail";
import { waLinkTo } from "../whatsapp";
import { Check, Chevron, Copy, Mail, MessageSquare, Phone, Pin, SendArrow, Trash, WhatsApp, Xmark } from "../icons";
import { Reveal } from "../ui";
import { cn } from "../utils/cn";

const STATUS: { id: "all" | "pending" | "accepted" | "declined" | "delivered"; label: string }[] = [
  { id: "all", label: "All" }, { id: "pending", label: "Awaiting payment" },
  { id: "accepted", label: "Accepted" }, { id: "declined", label: "Declined" }, { id: "delivered", label: "Delivered" },
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const METHOD_LABEL: Record<string, string> = { easypaisa: "EasyPaisa", jazzcash: "JazzCash", bank: "Bank Transfer", cod: "Cash on Delivery" };
function zoneLabel(id: string) { return DELIVERY_ZONES.find((z) => z.id === id)?.label ?? id; }

function StatusPill({ status }: { status: Order["status"] }) {
  const m: Record<Order["status"], { l: string; c: string }> = {
    pending: { l: "Awaiting payment", c: "border-amber/50 bg-amber/15 text-amber" }, accepted: { l: "Payment approved", c: "border-moss/50 bg-moss/15 text-moss" },
    processing: { l: "Packed", c: "border-oil/50 bg-oil/15 text-oil" }, "in-transit": { l: "In transit", c: "border-oil/50 bg-oil/15 text-oil" },
    "out-for-delivery": { l: "Out for delivery", c: "border-oil/50 bg-oil/15 text-oil" }, delivered: { l: "Delivered", c: "border-moss/50 bg-moss/15 text-moss" },
    declined: { l: "Payment declined", c: "border-rust/60 bg-rust/15 text-rust" },
  };
  const s = m[status];
  return <span className={cn("rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide", s.c)}>{s.l}</span>;
}

function Row({ label, value, action }: { label: string; value: React.ReactNode; action?: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-3 border-b border-line/40 pb-2.5 last:border-b-0"><div className="min-w-0"><dt className="text-fog">{label}</dt><dd className="mt-0.5 truncate text-paper">{value}</dd></div>{action}</div>;
}

export default function Dashboard() {
  const { orders, updateStatus } = useOrders();
  const { messages, replyTo, markRead, remove: removeMsg, unread } = useCustomerMessages();
  const accounts = getAllAccounts();
  const [view, setView] = useState<"sales" | "messages" | "users">("sales");
  const [userSearch, setUserSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "declined" | "delivered">("all");
  const [range, setRange] = useState<"week" | "month" | "all">("week");
  const [openId, setOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sentFlash, setSentFlash] = useState<string | null>(null);

  const stats = useMemo(() => {
    const now = new Date(), weekAgo = new Date(now.getTime() - 604800000), monthAgo = new Date(now.getTime() - 2592000000);
    const inRange = (d: Date) => range === "week" ? d >= weekAgo : range === "month" ? d >= monthAgo : true;
    const f = orders.filter((o) => inRange(new Date(o.date)));
    const bySt = (s: Order["status"]) => f.filter((o) => o.status === s).length;
    const byM = (m: string) => f.filter((o) => o.method === m).length;
    const rev = f.filter((o) => o.status !== "declined" && o.status !== "pending").reduce((s, o) => s + o.total, 0);
    const bp = new Map<string, number>(); f.forEach((o) => bp.set(o.productName, (bp.get(o.productName) || 0) + o.total));
    return { revenue: rev, count: f.length, pending: bySt("pending"), accepted: bySt("accepted") + bySt("processing") + bySt("in-transit") + bySt("out-for-delivery"), declined: bySt("declined"), delivered: bySt("delivered"), avg: f.length ? rev / Math.max(1, f.length - bySt("declined")) : 0, easypaisa: byM("easypaisa"), jazzcash: byM("jazzcash"), bank: byM("bank"), cod: byM("cod"), topProduct: [...bp.entries()].sort((a, b) => b[1] - a[1])[0] };
  }, [orders, range]);

  const daily = useMemo(() => { const t = new Date(); return Array.from({ length: 7 }, (_, i) => { const d = new Date(t.getTime() - (6 - i) * 86400000); return { label: DAYS[d.getDay()], value: orders.filter((o) => new Date(o.date).toDateString() === d.toDateString() && o.status !== "declined").reduce((s, o) => s + o.total, 0) }; }); }, [orders]);
  const visible = orders.filter((o) => filter === "all" ? true : filter === "accepted" ? ["accepted", "processing", "in-transit", "out-for-delivery"].includes(o.status) : o.status === filter);
  const copy = async (id: string, text: string) => { try { await navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 1200); } catch { /* */ } };

  /** Sends the reply straight into the customer's PSO Support chat.
   *  Deliberately does NOT open Gmail — use the Gmail button for that. */
  const doReply = (id: string) => {
    if (!replyText.trim()) return;
    replyTo(id, replyText.trim());
    setReplyText("");
    setSentFlash(id);
    window.setTimeout(() => setSentFlash((cur) => (cur === id ? null : cur)), 1800);
  };

  return (
    <section id="dashboard" className="grid-bg relative scroll-mt-24 overflow-hidden border-t border-line bg-coal">
      <div className="pointer-events-none absolute -right-32 -bottom-36 opacity-[0.06]"><svg viewBox="0 0 120 120" className="h-[480px] w-[480px] spin-rev" aria-hidden="true"><circle cx="60" cy="60" r="58" fill="none" stroke="#009a44" strokeWidth="2" /><circle cx="60" cy="60" r="52" fill="none" stroke="#009a44" strokeWidth="3" /><circle cx="81" cy="40" r="26" fill="#ffe000" /><text x="60" y="77" textAnchor="middle" fontSize="38" fontWeight="800" fill="#009a44" stroke="#f7fbff" strokeWidth="4" paintOrder="stroke" fontFamily="Archivo, sans-serif">PSO</text></svg></div>

      <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div><span className="font-mono text-[11px] tracking-[0.22em] text-moss uppercase">company dashboard</span><h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight text-paper sm:text-5xl">Sales overview</h1><p className="mt-3 max-w-md text-[14px] leading-relaxed text-fog">Review each order, verify the transaction ID against your Easypaisa / JazzCash inbox, then <span className="text-moss font-semibold">Accept</span> or <span className="text-rust font-semibold">Decline</span>.</p></div>
          <div className="flex gap-1 rounded-full border border-line bg-panel p-1">
            {(["week", "month", "all"] as const).map((r) => (<button key={r} onClick={() => setRange(r)} className={cn("rounded-full px-3 py-1.5 font-mono text-[10.5px] tracking-wide uppercase transition-colors", range === r ? "bg-oil text-paper" : "text-fog hover:text-paper")}>{r}</button>))}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          <button onClick={() => setView("sales")} className={cn("rounded-full border px-5 py-2.5 font-mono text-[11.5px] tracking-wide transition-all", view === "sales" ? "border-moss bg-moss text-paper" : "border-line text-fog2 hover:border-moss hover:text-moss")}>Sales overview</button>
          <button onClick={() => setView("messages")} className={cn("relative flex items-center gap-2 rounded-full border px-5 py-2.5 font-mono text-[11.5px] tracking-wide transition-all", view === "messages" ? "border-moss bg-moss text-paper" : "border-line text-fog2 hover:border-moss hover:text-moss")}><MessageSquare className="h-3.5 w-3.5" />Customer messages{unread > 0 && <span className={cn("ml-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[10px] font-bold", view === "messages" ? "bg-paper text-moss" : "bg-amber text-coal")}>{unread}</span>}</button>
          <button onClick={() => setView("users")} className={cn("flex items-center gap-2 rounded-full border px-5 py-2.5 font-mono text-[11.5px] tracking-wide transition-all", view === "users" ? "border-moss bg-moss text-paper" : "border-line text-fog2 hover:border-moss hover:text-moss")}><svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><circle cx="17" cy="10" r="2.8" /><path d="M19 21v-1.5a2.8 2.8 0 0 0-2-2.6" /></svg>Users <span className="font-mono text-moss">{accounts.length}</span></button>
        </div>

        {view === "sales" && (<>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[{ label: "Approved revenue", value: formatMoney(stats.revenue), sub: `${stats.count} orders · ${range}`, accent: "text-oil" }, { label: "Awaiting payment", value: String(stats.pending), sub: "verify & decide", accent: "text-amber" }, { label: "Accepted", value: String(stats.accepted), sub: "in the pipeline", accent: "text-moss" }, { label: "Declined", value: String(stats.declined), sub: "no payment", accent: "text-rust" }, { label: "Delivered", value: String(stats.delivered), sub: "completed", accent: "text-moss" }].map((c) => (<Reveal key={c.label}><div className="rounded-2xl border border-line bg-panel p-5"><div className="font-mono text-[10.5px] tracking-[0.18em] text-fog uppercase">{c.label}</div><div className={cn("mt-2 font-display text-3xl font-extrabold tabular-nums", c.accent)}>{c.value}</div><div className="mt-1 font-mono text-[10px] text-fog">{c.sub}</div></div></Reveal>))}</div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <Reveal delay={80}><div className="rounded-2xl border border-line bg-panel p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><h3 className="font-display text-lg font-bold text-paper uppercase">Daily sales</h3><span className="font-mono text-[10px] text-fog">PKR · approved only</span></div><div className="flex items-end gap-2.5">{daily.map((d) => { const h = Math.max(4, (d.value / Math.max(...daily.map((x) => x.value), 1)) * 180); return (<div key={d.label} className="group relative flex-1"><div className="mx-auto h-[180px] w-full max-w-[40px]"><div className="mx-auto w-full rounded-t-md bg-oil transition-all duration-500" style={{ height: `${h}px` }} /></div><span className="mt-2 block text-center font-mono text-[10px] text-fog">{d.label}</span><span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 scale-0 rounded bg-ink px-2 py-1 font-mono text-[10px] text-paper transition-transform group-hover:scale-100">{formatMoney(d.value)}</span></div>); })}</div></div></Reveal>
            <Reveal delay={160}><div className="flex h-full flex-col rounded-2xl border border-line bg-panel p-5 sm:p-6"><h3 className="font-mono text-[11px] tracking-[0.18em] text-fog2 uppercase">by payment method</h3><div className="mt-5 space-y-4">{[{ label: "EasyPaisa", value: stats.easypaisa, color: "bg-moss" }, { label: "JazzCash", value: stats.jazzcash, color: "bg-oil" }, { label: "Cash on delivery", value: stats.cod, color: "bg-line2" }, { label: "Bank Transfer", value: stats.bank, color: "bg-fog" }].map((m) => { const total = stats.easypaisa + stats.jazzcash + stats.bank + stats.cod || 1; const pct = (m.value / total) * 100; return (<div key={m.label}><div className="flex items-center justify-between font-mono text-[12px]"><span className="text-paper">{m.label}</span><span className="text-fog">{m.value} · {pct.toFixed(0)}%</span></div><div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-line"><div className={cn("h-full rounded-full transition-all duration-500", m.color)} style={{ width: `${pct}%` }} /></div></div>); })}</div><div className="mt-6 border-t border-line pt-4"><span className="font-mono text-[10.5px] tracking-wider text-fog uppercase">best seller</span><p className="mt-1 font-display text-base font-bold text-oil">{stats.topProduct ? stats.topProduct[0] : "—"}</p></div></div></Reveal>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3"><h3 className="font-display text-2xl font-bold text-paper uppercase">Orders</h3><div className="flex flex-wrap gap-2">{STATUS.map((s) => { const ct = s.id === "all" ? orders.length : s.id === "accepted" ? orders.filter((o) => ["accepted", "processing", "in-transit", "out-for-delivery"].includes(o.status)).length : orders.filter((o) => o.status === s.id).length; return (<button key={s.id} onClick={() => setFilter(s.id)} className={cn("flex items-center gap-1.5 rounded-full border px-4 py-2 font-mono text-[11px] tracking-wide transition-all", filter === s.id ? "border-moss bg-moss text-paper" : "border-line text-fog hover:border-line2 hover:text-paper")}>{s.label}<span className="tabular-nums">{ct}</span></button>); })}</div></div>
          {visible.length === 0 && <div className="mt-5 rounded-2xl border border-line bg-panel px-5 py-16 text-center font-mono text-[12px] text-fog">{orders.length === 0 ? "No orders yet." : "No orders match this filter."}</div>}
          <ul className="mt-5 space-y-3">{visible.map((o) => { const isOpen = openId === o.id; const date = new Date(o.date); return (<li key={o.id} className={cn("overflow-hidden rounded-2xl border bg-panel transition-colors", isOpen ? "border-moss/50" : "border-line hover:border-line2")}><button onClick={() => setOpenId(isOpen ? null : o.id)} className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-left sm:grid-cols-[1.4fr_1fr_1fr_auto]" aria-expanded={isOpen}><div><div className="flex items-center gap-2"><span className="font-display text-[15px] font-bold text-paper">{o.customer}</span><StatusPill status={o.status} /></div><div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] text-fog"><span className="text-moss">{o.id}</span><span className="text-oil">{o.tracking}</span><span>{date.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })} · {date.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}</span></div></div><div className="hidden font-mono text-[12px] text-fog2 sm:block"><div className="truncate">{o.productName}</div><div className="text-[10.5px] text-fog">Qty {o.qty}</div></div><div className="hidden text-right sm:block"><div className="font-display text-lg font-extrabold text-paper tabular-nums">{formatMoney(o.total)}</div><div className="text-[10px] text-fog uppercase">{METHOD_LABEL[o.method]}</div></div><Chevron className={cn("h-4 w-4 text-fog transition-transform", isOpen && "rotate-180 text-moss")} /></button>
          {isOpen && (<div className="border-t border-line bg-panel2/40 px-5 py-5 sm:px-6"><div className="grid gap-6 lg:grid-cols-2"><div><h4 className="font-mono text-[10px] tracking-[0.2em] text-fog uppercase">Customer details</h4><dl className="mt-3 space-y-2.5 font-mono text-[12.5px]"><Row label="Full name" value={o.customer} /><Row label="Phone" value={o.phone} action={<div className="flex gap-1.5"><a href={`tel:${o.phone}`} className="rounded-md border border-line bg-panel px-2 py-1 text-fog hover:border-oil hover:text-oil"><Phone className="h-3 w-3" /></a><a href={waLinkTo(o.phone, `Hi ${o.customer}, PSO Lubricants regarding order ${o.id}.`)} target="_blank" rel="noopener noreferrer" className="rounded-md border border-line bg-panel px-2 py-1 text-moss hover:border-moss"><WhatsApp className="h-3 w-3" /></a></div>} />{o.email && <Row label="Email" value={o.email} action={<a href={gmailComposeLink(o.email, `Order ${o.id}`, `Hi ${o.customer},\n\n`)} target="_blank" rel="noopener noreferrer" className="rounded-md border border-line bg-panel px-2 py-1 text-fog hover:border-oil hover:text-oil"><Mail className="h-3 w-3" /></a>} />}<Row label="City" value={o.city} /><Row label="Region" value={zoneLabel(o.zone)} /><div><dt className="text-fog">Address</dt><dd className="mt-1 flex items-start gap-2 rounded-lg border border-line bg-panel p-3 text-[12.5px] text-paper"><Pin className="mt-0.5 h-4 w-4 shrink-0 text-oil" />{o.address}</dd></div>{o.notes && <div><dt className="text-fog">Notes</dt><dd className="mt-1 rounded-lg border border-line bg-panel p-3 text-[12px] text-fog2">{o.notes}</dd></div>}</dl></div><div><h4 className="font-mono text-[10px] tracking-[0.2em] text-fog uppercase">Order & payment</h4><dl className="mt-3 space-y-2.5 font-mono text-[12.5px]"><Row label="Product" value={o.productName} /><Row label="Grade" value={o.grade} /><Row label="Qty" value={String(o.qty)} /><Row label="Unit price" value={formatMoney(o.unitPrice)} /><Row label="Delivery" value={o.deliveryFee === 0 ? "Free" : formatMoney(o.deliveryFee)} /><Row label="Total" value={<span className="font-display text-lg font-extrabold text-oil">{formatMoney(o.total)}</span>} /><Row label="Method" value={METHOD_LABEL[o.method]} /><Row label="Order ID" value={o.id} action={<button onClick={() => copy(`id-${o.id}`, o.id)} className="rounded-md border border-line bg-panel px-2 py-1 text-fog hover:border-oil hover:text-oil">{copiedId === `id-${o.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}</button>} /><Row label="Tracking" value={<span className="text-moss font-semibold">{o.tracking}</span>} action={<button onClick={() => copy(`t-${o.id}`, o.tracking)} className="rounded-md border border-line bg-panel px-2 py-1 text-fog hover:border-oil hover:text-oil">{copiedId === `t-${o.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}</button>} />{o.method !== "cod" && <div><dt className="text-fog">Transaction ID</dt><dd className="mt-1 flex items-center justify-between rounded-lg border border-oil/40 bg-oil/10 p-3"><span className="font-mono text-[13px] font-semibold text-paper tracking-wider">{o.transactionId || "—"}</span>{o.transactionId && <button onClick={() => copy(`tx-${o.id}`, o.transactionId!)} className="rounded-md border border-oil/40 bg-panel px-2 py-1 text-oil hover:bg-oil hover:text-paper">{copiedId === `tx-${o.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}</button>}</dd></div>}</dl></div></div><div className="mt-6 border-t border-line pt-5">{o.status === "pending" && <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-mono text-[11.5px] text-fog">Payment verified?</p><div className="flex gap-2"><button onClick={() => updateStatus(o.id, "declined")} className="flex items-center gap-2 rounded-full border border-rust/60 bg-rust/10 px-5 py-2.5 font-display text-[12px] font-bold text-rust uppercase hover:bg-rust hover:text-paper"><Xmark className="h-3.5 w-3.5" /> Decline</button><button onClick={() => updateStatus(o.id, "accepted")} className="shine flex items-center gap-2 rounded-full bg-moss px-6 py-2.5 font-display text-[12px] font-bold text-paper uppercase hover:bg-[#00b850]"><Check className="h-3.5 w-3.5" /> Accept</button></div></div>}{o.status !== "pending" && o.status !== "declined" && <div className="flex flex-wrap items-center justify-between gap-3"><span className="font-mono text-[11.5px] text-fog">Dispatch:</span><div className="flex items-center gap-2"><select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value as Order["status"])} className="rounded-full border border-line bg-panel px-3 py-2 font-mono text-[11px] text-paper outline-none focus:border-oil"><option value="accepted">Accepted</option><option value="processing">Packed</option><option value="in-transit">In transit</option><option value="out-for-delivery">Out for delivery</option><option value="delivered">Delivered</option></select><button onClick={() => updateStatus(o.id, "declined")} className="rounded-full border border-rust/40 px-3 py-2 font-mono text-[10.5px] text-rust hover:bg-rust/10">Cancel</button></div></div>}{o.status === "declined" && <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-mono text-[11.5px] text-rust">Declined — no payment.</p><button onClick={() => updateStatus(o.id, "pending")} className="rounded-full border border-line px-4 py-2 font-mono text-[10.5px] text-fog hover:border-oil hover:text-oil">Restore</button></div>}</div></div>)}</li>); })}</ul>
        </>)}

        {view === "messages" && (<div className="mt-8">{messages.length === 0 ? (<div className="rounded-2xl border border-line bg-panel px-5 py-16 text-center"><MessageSquare className="mx-auto h-8 w-8 text-fog/40" /><p className="mt-3 font-mono text-[12px] text-fog">No customer messages yet.</p></div>) : (<div className="space-y-4">{messages.map((msg) => { const date = new Date(msg.date); const isReplying = replyTarget === msg.id; return (<article key={msg.id} className={cn("rounded-2xl border bg-panel p-5", msg.status === "new" ? "border-amber/40" : "border-line")}><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-moss/15 font-mono text-[12px] font-bold text-moss">{msg.customerName[0]?.toUpperCase()}</span><div><h4 className="font-display text-[15px] font-bold text-paper">{msg.customerName}</h4><div className="font-mono text-[10px] text-fog">{date.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })} · {date.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}</div></div></div><span className={cn("rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase", msg.status === "new" ? "border-amber/50 bg-amber/15 text-amber" : msg.status === "replied" ? "border-moss/50 bg-moss/15 text-moss" : "border-line2/50 bg-line2/15 text-fog2")}>{msg.status}</span></div><p className="mt-3 rounded-lg border border-line bg-panel2/50 p-3.5 text-[13px] leading-relaxed text-fog2">{msg.message}</p><div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[11.5px] text-fog">{msg.customerPhone && <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {msg.customerPhone}</span>}{msg.customerEmail && <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {msg.customerEmail}</span>}</div>{msg.thread.length > 1 && <div className="mt-3 space-y-2 rounded-lg border border-line bg-panel2/40 p-3"><p className="font-mono text-[9.5px] tracking-[0.2em] text-fog uppercase">Conversation</p>{msg.thread.map((t) => (<div key={t.id} className={cn("flex", t.from === "admin" ? "justify-end" : "justify-start")}><div className={cn("max-w-[80%] rounded-lg px-3 py-2 text-[12.5px] leading-relaxed", t.from === "admin" ? "rounded-br-sm bg-moss/20 text-paper" : "rounded-bl-sm border border-line bg-panel text-fog2")}><p className={cn("mb-0.5 font-mono text-[9px] font-semibold", t.from === "admin" ? "text-moss" : "text-fog")}>{t.from === "admin" ? "You" : msg.customerName}</p>{t.text}</div></div>))}</div>}<div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">{msg.customerPhone && <a href={waLinkTo(msg.customerPhone, `Hi ${msg.customerName}, PSO Lubricants replying to your message.`)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 font-mono text-[10.5px] text-fog2 transition-colors hover:border-moss hover:text-moss"><WhatsApp className="h-3 w-3" /> WhatsApp</a>}{msg.customerEmail && <a href={gmailComposeLink(msg.customerEmail, "RE: Your PSO enquiry", `Hi ${msg.customerName},\n\n`)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 font-mono text-[10.5px] text-fog2 transition-colors hover:border-oil hover:text-oil"><Mail className="h-3 w-3" /> Gmail</a>}<button onClick={() => { setReplyTarget(isReplying ? null : msg.id); markRead(msg.id); }} className={cn("flex items-center gap-1.5 rounded-full border px-4 py-2 font-mono text-[10.5px] transition-colors", isReplying ? "border-oil bg-oil/10 text-oil" : "border-line text-fog2 hover:border-oil hover:text-oil")}><SendArrow className="h-3 w-3" /> Reply</button><button onClick={() => removeMsg(msg.id)} className="ml-auto text-fog/60 hover:text-rust"><Trash className="h-4 w-4" /></button></div>{isReplying && (
  <div className="mt-3">
    <div className="flex gap-2">
      <input autoFocus value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && replyText.trim()) doReply(msg.id); }} placeholder="Type your reply — it appears instantly in the customer's PSO Support chat…" className="flex-1 rounded-lg border border-line bg-steel px-3 py-2.5 text-[13px] text-paper outline-none placeholder:text-fog/50 focus:border-oil" />
      <button onClick={() => doReply(msg.id)} disabled={!replyText.trim()} className="shine flex items-center gap-1.5 rounded-full bg-oil px-5 py-2.5 font-display text-[12px] font-bold text-paper uppercase hover:bg-paper hover:text-ink disabled:opacity-40"><SendArrow className="h-3.5 w-3.5" /> Send</button>
    </div>
    <div className="mt-1.5 flex items-center justify-between">
      <span className="font-mono text-[9.5px] text-fog">Delivered inside the website chat — Gmail only opens from the Gmail button.</span>
      {sentFlash === msg.id && <span className="flex items-center gap-1 font-mono text-[10px] font-semibold text-moss"><Check className="h-3 w-3" /> Sent to customer</span>}
    </div>
  </div>
)}</article>); })}</div>)}</div>)}

        {/* ═══ USERS VIEW ═══ */}
        {view === "users" && (
          <div className="mt-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl font-bold text-paper uppercase">User Management</h3>
                <p className="mt-1 font-mono text-[11px] text-fog">Manage all registered customers</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-moss bg-moss/15 px-4 py-2 font-mono text-[12px] font-bold text-moss">Total Users: {accounts.length}</span>
                <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search by name or email…" className="rounded-lg border border-line bg-steel px-4 py-2.5 font-mono text-[12px] text-paper outline-none placeholder:text-fog/50 focus:border-oil" />
              </div>
            </div>

            {accounts.length === 0 ? (
              <div className="rounded-2xl border border-line bg-panel px-5 py-16 text-center">
                <p className="font-mono text-[12px] text-fog">No registered users yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-line bg-panel">
                <table className="min-w-[700px] w-full">
                  <thead>
                    <tr className="border-b border-line font-mono text-[10px] tracking-[0.18em] text-fog uppercase">
                      <th className="px-5 py-3 text-left">#</th>
                      <th className="px-5 py-3 text-left">Name</th>
                      <th className="px-5 py-3 text-left">Email</th>
                      <th className="px-5 py-3 text-left">Provider</th>
                      <th className="px-5 py-3 text-left">Joined</th>
                      <th className="px-5 py-3 text-left">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts
                      .filter((a) => !userSearch || a.name.toLowerCase().includes(userSearch.toLowerCase()) || a.email.toLowerCase().includes(userSearch.toLowerCase()))
                      .map((a, i) => {
                        const joined = new Date(a.createdAt);
                        return (
                          <tr key={a.id} className="border-b border-line/50 transition-colors hover:bg-panel2/60">
                            <td className="px-5 py-3 font-mono text-[11px] text-fog">#{i + 1}</td>
                            <td className="px-5 py-3 font-display text-[13px] font-bold text-paper">{a.name}</td>
                            <td className="px-5 py-3 font-mono text-[11.5px] text-fog2">{a.email}</td>
                            <td className="px-5 py-3 font-mono text-[10.5px] text-fog2 uppercase">{a.provider}</td>
                            <td className="px-5 py-3 font-mono text-[11px] text-fog">{joined.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}</td>
                            <td className="px-5 py-3"><span className="rounded-full border border-moss/50 bg-moss/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-moss">Active</span></td>
                            <td className="px-5 py-3 text-right">
                              <a href={gmailComposeLink(a.email, "Hello from PSO Lubricants", `Hi ${a.name},\n\n`)} target="_blank" rel="noopener noreferrer" className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line text-fog transition-colors hover:border-oil hover:text-oil">
                                <Mail className="h-3 w-3" />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
