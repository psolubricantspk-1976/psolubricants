import { useCallback } from "react";
import { useCloudAuth } from "./CloudAuth";
import { completeRequest, ensureSession, notifyCloudChanged, requestId, requireCloud } from "./cloud";
import { useCloudData, readAll } from "./useCloudData";

export type MessageStatus = "new" | "read" | "replied";
export type ThreadEntry = { id: string; from: "customer" | "admin"; text: string; date: string };
export type CustomerMessage = {
  id: string; customerName: string; customerPhone: string; customerEmail: string;
  message: string; date: string; status: MessageStatus; thread: ThreadEntry[];
};
type ConversationRow = {
  id: string; customer_name: string; customer_phone: string; customer_email: string;
  message: string; created_at: string; status: MessageStatus;
};
type EntryRow = { id: string; conversation_id: string; sender: "customer" | "admin"; text: string; created_at: string };
const TABLES = ["conversations", "chat_entries"];
const toMessage = (row: ConversationRow, thread: ThreadEntry[] = []): CustomerMessage => ({
  id: row.id, customerName: row.customer_name, customerPhone: row.customer_phone,
  customerEmail: row.customer_email, message: row.message, date: row.created_at, status: row.status, thread,
});
async function loadMessages(ownerId?: string) {
  const client = requireCloud();
  const conversations = await readAll<ConversationRow>((from, to) => {
    let query = client.from("conversations").select("id,customer_name,customer_phone,customer_email,message,created_at,status").eq("archived", false);
    if (ownerId) query = query.eq("owner_id", ownerId);
    return query.order("created_at", { ascending: false }).order("id").range(from, to);
  });
  const entries = await readAll<EntryRow>((from, to) => {
    let query = client.from("chat_entries").select("id,conversation_id,sender,text,created_at,conversations!inner(owner_id,archived)").eq("conversations.archived", false);
    if (ownerId) query = query.eq("conversations.owner_id", ownerId);
    return query.order("created_at").order("id").range(from, to);
  });
  const threads = new Map<string, ThreadEntry[]>();
  for (const entry of entries) {
    const thread = threads.get(entry.conversation_id) ?? [];
    thread.push({ id: entry.id, from: entry.sender, text: entry.text, date: entry.created_at });
    threads.set(entry.conversation_id, thread);
  }
  return conversations.map((row) => toMessage(row, threads.get(row.id)));
}
export function useCustomerMessages(enabled = true, scope: "own" | "admin" = "own") {
  const { session } = useCloudAuth();
  const ownerId = scope === "own" ? session?.user.id : undefined;
  const load = useCallback(() => loadMessages(ownerId), [ownerId]);
  const { data: messages, ...sync } = useCloudData(TABLES, load, enabled);
  const addMessage = async (input: Omit<CustomerMessage, "id" | "date" | "status" | "thread">, captchaToken?: string) => {
    const client = await ensureSession(captchaToken);
    const { data: session } = await client.auth.getSession();
    const scope = `chat-${session.session!.user.id}`;
    const id = await requestId(scope, input);
    const { data, error } = await client.rpc("start_conversation", { p_request_id: id, p_input: input });
    if (error) throw error;
    if (!data) throw new Error("Your conversation was not confirmed. Please retry.");
    await completeRequest(scope, input);
    notifyCloudChanged();
    return toMessage(data as ConversationRow);
  };
  const sendReply = async (id: string, text: string) => {
    const client = requireCloud();
    const { data: session } = await client.auth.getSession();
    if (!session.session) throw new Error("Please sign in again.");
    const scope = `reply-${session.session.user.id}-${id}`;
    const entryId = await requestId(scope, text);
    const { error } = await client.rpc("send_reply", { p_conversation: id, p_entry_id: entryId, p_text: text });
    if (error) throw error;
    await completeRequest(scope, text);
    notifyCloudChanged();
  };
  const manage = async (id: string, action: "read" | "archive") => {
    const { error } = await requireCloud().rpc("manage_conversation", { p_id: id, p_action: action });
    if (error) throw error;
    notifyCloudChanged();
  };
  return { messages, addMessage, addCustomerReply: sendReply, replyTo: sendReply,
    markRead: (id: string) => manage(id, "read"), remove: (id: string) => manage(id, "archive"),
    unread: messages.filter((m) => m.status === "new").length, ...sync };
}

// Only the conversation pointer stays in browser storage, never the message database.
export function getSessionId(): string | null {
  try { return localStorage.getItem("pso-support-session"); } catch { return null; }
}
export function setSessionId(id: string) {
  try { localStorage.setItem("pso-support-session", id); } catch { /* Optional convenience only. */ }
}
