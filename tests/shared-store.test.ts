import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
const customerA = randomUUID();
const customerB = randomUUID();
const admin = randomUUID();
async function identity(id: string | null, role = "authenticated") {
  await db.exec("reset role;");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id ?? ""]);
  await db.exec(`set role ${role};`);
}
async function rpc<T = unknown>(name: string, args: unknown[], casts: string[]) {
  const result = await db.query<{ result: T }>(`select to_jsonb(result) as result from public.${name}(${args.map((_, i) => `$${i + 1}::${casts[i]}`).join(",")}) as result`, args);
  return result.rows.map((row) => row.result);
}
const buyer = { customer: "Test Buyer", phone: "03001234567", email: "buyer@example.test", address: "12 Test Road Multan", city: "Multan", zone: "spunjab", method: "cod", notes: "Test" };
const cart = [{ productId: "blaze", qty: 2 }, { productId: "carient", qty: 1 }];
const checkoutId = randomUUID();
let orderId: string;
let tracking: string;
let conversationId: string;
type SavedOrder = { id: string; tracking: string; status: string; details: { total: number; deliveryFee: number; unitPrice: number } };

test("shared cloud database security and business rules", async (suite) => {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;
    grant usage on schema public, auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
  `);
  await db.exec(await readFile(new URL("../supabase/migrations/001_shared_store.sql", import.meta.url), "utf8"));
  await db.query("insert into auth.users(id,email) values($1,'a@example.test'),($2,'b@example.test'),($3,'owner@example.test')", [customerA, customerB, admin]);
  await db.query("insert into public.admin_users values($1)", [admin]);

  await suite.test("anonymous visitors cannot read orders or call checkout without authentication", async () => {
    await identity(null, "anon");
    await assert.rejects(db.query("select * from public.orders"), /permission denied/);
    await assert.rejects(rpc("create_checkout", [checkoutId, JSON.stringify(cart), JSON.stringify(buyer)], ["uuid", "jsonb", "jsonb"]), /permission denied/);
  });
  await suite.test("checkout calculates trusted prices and charges delivery once for the whole cart", async () => {
    await identity(customerA);
    const result = await rpc<SavedOrder>("create_checkout", [checkoutId, JSON.stringify(cart.map((item) => ({ ...item, unitPrice: 1, total: 1 }))), JSON.stringify({ ...buyer, total: 1, status: "accepted" })], ["uuid", "jsonb", "jsonb"]);
    assert.equal(result.length, 2);
    assert.equal(result.reduce((sum, order) => sum + order.details.total, 0), 13600);
    assert.equal(result.reduce((sum, order) => sum + order.details.deliveryFee, 0), 900);
    assert.ok(result.every((order) => order.status === "pending"));
    assert.equal(result[0].tracking, result[1].tracking);
    orderId = result[0].id;
    tracking = result[0].tracking;
  });
  await suite.test("retrying the same checkout creates no duplicate rows", async () => {
    const again = await rpc<SavedOrder>("create_checkout", [checkoutId, JSON.stringify(cart), JSON.stringify(buyer)], ["uuid", "jsonb", "jsonb"]);
    assert.equal(again.length, 2);
    assert.equal(again[0].id, orderId);
    assert.equal((await db.query("select * from public.orders")).rows.length, 2);
  });
  await suite.test("one invalid cart line rolls back the whole checkout", async () => {
    await assert.rejects(rpc("create_checkout", [randomUUID(), JSON.stringify([...cart, { productId: "missing", qty: 1 }]), JSON.stringify(buyer)], ["uuid", "jsonb", "jsonb"]), /Product is no longer available/);
    assert.equal((await db.query("select * from public.orders")).rows.length, 2);
    for (const qty of [0, -1, 101, 1.5]) {
      await assert.rejects(rpc("create_checkout", [randomUUID(), JSON.stringify([{ productId: "blaze", qty }]), JSON.stringify(buyer)], ["uuid", "jsonb", "jsonb"]), /quantity|Quantity/);
    }
    await assert.rejects(rpc("create_checkout", [randomUUID(), JSON.stringify(cart), JSON.stringify({ ...buyer, method: "easypaisa", transactionId: "" })], ["uuid", "jsonb", "jsonb"]), /transaction ID/);
  });
  await suite.test("customer B cannot see customer A's orders or profiles", async () => {
    await identity(customerB);
    assert.deepEqual((await db.query("select * from public.orders")).rows, []);
    assert.equal((await db.query("select * from public.customer_profiles")).rows.length, 1);
    await assert.rejects(rpc("set_order_status", [orderId, "accepted"], ["text", "text"]), /Admin access required/);
    await assert.rejects(db.query("update public.orders set status='accepted'"), /permission denied/);
    await assert.rejects(db.query("insert into public.admin_users values($1)", [customerB]), /permission denied/);
    await assert.rejects(db.query("update public.customer_profiles set email='owner@example.test'"), /permission denied/);
  });
  await suite.test("cross-device tracking requires the full code plus phone and returns no private fields", async () => {
    await identity(null, "anon");
    const [orders] = await rpc<Record<string, unknown>[]>("track_order", [tracking, buyer.phone], ["text", "text"]);
    assert.equal(orders.length, 2);
    for (const order of orders) {
      assert.deepEqual(Object.keys(order).sort(), ["id", "tracking", "date", "status", "productName", "qty", "total", "city"].sort());
    }
    assert.deepEqual((await rpc("track_order", [tracking, "03009999999"], ["text", "text"]))[0], []);
    assert.deepEqual((await rpc("track_order", [tracking.slice(0, 8), buyer.phone], ["text", "text"]))[0], []);
    assert.equal((await rpc<Record<string, unknown>[]>("track_order", [orderId.toLowerCase(), buyer.phone], ["text", "text"]))[0].length, 1);
  });
  await suite.test("admin sees orders from another device and can update status", async () => {
    await identity(admin);
    assert.equal((await db.query("select * from public.orders")).rows.length, 2);
    await rpc("set_order_status", [orderId, "accepted"], ["text", "text"]);
    await assert.rejects(rpc("set_order_status", [orderId, "invalid"], ["text", "text"]), /check constraint/);
    await identity(customerA);
    const { rows } = await db.query<{ status: string }>("select status from public.orders where id=$1", [orderId]);
    assert.equal(rows[0].status, "accepted");
  });
  await suite.test("conversation starts atomically and retries are idempotent", async () => {
    await identity(customerA);
    const id = randomUUID();
    const input = JSON.stringify({ customerName: "Test Buyer", customerPhone: buyer.phone, message: "Where is my order?" });
    const [conversation] = await rpc<{ id: string }>("start_conversation", [id, input], ["uuid", "jsonb"]);
    conversationId = conversation.id;
    const [again] = await rpc<{ id: string }>("start_conversation", [id, input], ["uuid", "jsonb"]);
    assert.equal(again.id, conversationId);
    assert.equal((await db.query("select * from public.chat_entries")).rows.length, 1);
  });
  await suite.test("other customers cannot read/reply to conversations or spoof admin messages", async () => {
    await identity(customerB);
    assert.equal((await db.query("select * from public.conversations")).rows.length, 0);
    assert.equal((await db.query("select * from public.chat_entries")).rows.length, 0);
    await assert.rejects(rpc("send_reply", [conversationId, randomUUID(), "Intrusion"], ["uuid", "uuid", "text"]), /Conversation unavailable/);
    await assert.rejects(db.query("insert into public.chat_entries values($1,$2,$3,'admin','Fake',now())", [randomUUID(), conversationId, customerB]), /permission denied/);
    await identity(customerA);
    await assert.rejects(rpc("manage_conversation", [conversationId, "archive"], ["uuid", "text"]), /Admin access required/);
  });
  await suite.test("admin replies persist for the customer, without duplicate retry messages", async () => {
    await identity(admin);
    const id = randomUUID();
    await rpc("send_reply", [conversationId, id, "Your order is being packed."], ["uuid", "uuid", "text"]);
    await rpc("send_reply", [conversationId, id, "Your order is being packed."], ["uuid", "uuid", "text"]);
    await identity(customerA);
    const { rows } = await db.query<{ sender: string; text: string }>("select sender,text from public.chat_entries order by created_at");
    assert.equal(rows.length, 2);
    assert.equal(rows[1].sender, "admin");
    assert.equal(rows[1].text, "Your order is being packed.");
    await rpc("send_reply", [conversationId, randomUUID(), "Thank you"], ["uuid", "uuid", "text"]);
    await identity(admin);
    assert.equal((await db.query<{ status: string }>("select status from public.conversations")).rows[0].status, "new");
    await rpc("manage_conversation", [conversationId, "read"], ["uuid", "text"]);
    assert.equal((await db.query<{ status: string }>("select status from public.conversations")).rows[0].status, "read");
  });
  await suite.test("oversized messages rejected and archived conversations cannot receive replies", async () => {
    await assert.rejects(rpc("send_reply", [conversationId, randomUUID(), "x".repeat(4001)], ["uuid", "uuid", "text"]), /4000 characters/);
    await rpc("manage_conversation", [conversationId, "archive"], ["uuid", "text"]);
    await identity(customerA);
    await assert.rejects(rpc("send_reply", [conversationId, randomUUID(), "Again"], ["uuid", "uuid", "text"]), /Conversation unavailable/);
  });
  await suite.test("per-user checkout limits stop repeated submissions", async () => {
    await identity(customerB);
    for (let index = 0; index < 10; index++) await rpc("create_checkout", [randomUUID(), JSON.stringify(cart), JSON.stringify(buyer)], ["uuid", "jsonb", "jsonb"]);
    await assert.rejects(rpc("create_checkout", [randomUUID(), JSON.stringify(cart), JSON.stringify(buyer)], ["uuid", "jsonb", "jsonb"]), /Too many orders/);
  });
  await db.close();
});
