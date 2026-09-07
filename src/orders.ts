import { useEffect, useState } from "react";
import { PRODUCTS, DELIVERY_ZONES, type Product } from "./data";

export type PaymentMethod = "easypaisa" | "jazzcash" | "cod" | "bank";
export type TrackingStatus =
  | "pending"
  | "accepted"
  | "processing"
  | "in-transit"
  | "out-for-delivery"
  | "delivered"
  | "declined";

export type Order = {
  id: string;
  tracking: string;
  date: string;
  productId: string;
  productName: string;
  grade: string;
  qty: number;
  unitPrice: number;
  deliveryFee: number;
  total: number;
  customer: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  zone: string;
  method: PaymentMethod;
  accountLabel: string;
  accountNumber: string;
  transactionId?: string;
  notes?: string;
  status: TrackingStatus;
};

const KEY = "pso-orders-v1";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Always reads the freshest orders straight from storage — never a stale in-memory copy. */
export function readOrders(): Order[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

/** Forgiving lookup: ignores case, spaces and dashes; accepts the order number OR the
 *  tracking code, in full or in part (as long as the fragment is meaningful). */
export function searchOrders(list: Order[], query: string): Order | null {
  const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const nq = norm(query);
  if (nq.length < 5) return null;
  return (
    list.find((o) => {
      const nid = norm(o.id);
      const ntr = norm(o.tracking);
      return nid === nq || ntr === nq || nid.includes(nq) || ntr.includes(nq);
    }) ?? null
  );
}

function genId(): string {
  const year = new Date().getFullYear();
  const rand = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("");
  return `PSO-${year}-${rand}`;
}

function genTracking(): string {
  return Array.from({ length: 12 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Order[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(orders));
    } catch {
      /* ignore */
    }
  }, [orders]);

  const addOrder = (o: Omit<Order, "id" | "tracking" | "date" | "status">, sharedTracking?: string) => {
    const id = genId();
    const tracking = sharedTracking || genTracking();
    const order: Order = { ...o, id, tracking, date: new Date().toISOString(), status: "pending" };
    setOrders((prev) => [order, ...prev]);
    return order;
  };

  const updateStatus = (id: string, status: TrackingStatus) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

  const findOrder = (query: string) => searchOrders(readOrders(), query);

  const totals = {
    count: orders.length,
    revenue: orders.reduce((s, o) => s + o.total, 0),
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    completed: orders.filter((o) => o.status === "delivered").length,
  };

  return { orders, addOrder, updateStatus, findOrder, totals };
}

export function formatMoney(n: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getDeliveryFee(zoneId: string) {
  return DELIVERY_ZONES.find((z) => z.id === zoneId)?.fee ?? 0;
}

export function getDeliveryDays(zoneId: string) {
  return DELIVERY_ZONES.find((z) => z.id === zoneId)?.days ?? "3-5";
}

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; sub: string; disabled?: boolean }[] = [
  { id: "easypaisa", label: "EasyPaisa", sub: "Manual transfer" },
  { id: "cod", label: "Cash on delivery", sub: "Pay at your door" },
  { id: "jazzcash", label: "JazzCash", sub: "Manual transfer" },
  { id: "bank", label: "Bank transfer", sub: "Setup required", disabled: true },
];

export const RECEIVING_NUMBER = "03077885585";
