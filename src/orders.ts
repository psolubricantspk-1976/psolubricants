import { completeRequest, ensureSession, notifyCloudChanged, requestId, requireCloud } from "./cloud";
import { useCloudData, readAll } from "./useCloudData";
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

export type OrderRow = { id: string; tracking: string; created_at: string; status: TrackingStatus; details: Omit<Order, "id" | "tracking" | "date" | "status"> };
export function toOrder(row: OrderRow): Order {
  return { ...row.details, id: row.id, tracking: row.tracking, date: row.created_at, status: row.status };
}
const TABLES = ["orders"];
async function loadOrders() {
  const client = requireCloud();
  const rows = await readAll<OrderRow>((from, to) => client.from("orders").select("id,tracking,created_at,status,details").order("created_at", { ascending: false }).order("id").range(from, to));
  return rows.map(toOrder);
}
export type CheckoutCustomer = Pick<Order, "customer" | "phone" | "email" | "address" | "city" | "zone" | "method" | "transactionId" | "notes">;
export async function createCheckout(items: { productId: string; qty: number }[], customer: CheckoutCustomer, captchaToken?: string) {
  const client = await ensureSession(captchaToken);
  const { data: sessionData } = await client.auth.getSession();
  const scope = `checkout-${sessionData.session!.user.id}`;
  const payload = { items, customer };
  const id = await requestId(scope, payload);
  const { data, error } = await client.rpc("create_checkout", { p_request_id: id, p_items: items, p_customer: customer });
  if (error) throw error;
  if (!data?.length) throw new Error("The server did not confirm your order. Please retry.");
  const orders = (data as OrderRow[]).map(toOrder);
  await completeRequest(scope, payload);
  notifyCloudChanged();
  return orders;
}
export type TrackedOrder = Pick<Order, "id" | "tracking" | "date" | "status" | "productName" | "qty" | "total" | "city">;
export async function trackOrders(code: string, phone: string): Promise<TrackedOrder[]> {
  const { data, error } = await requireCloud().rpc("track_order", { p_code: code, p_phone: phone });
  if (error) throw error;
  return data ?? [];
}
export function useOrders(enabled = true) {
  const { data: orders, ...sync } = useCloudData(TABLES, loadOrders, enabled);
  const updateStatus = async (id: string, status: TrackingStatus) => {
    const { error } = await requireCloud().rpc("set_order_status", { p_id: id, p_status: status });
    if (error) throw error;
    notifyCloudChanged();
  };
  return { orders, updateStatus, ...sync };
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
