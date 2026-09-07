import { useEffect, useState } from "react";

export type MessageStatus = "new" | "read" | "replied";

export type ThreadEntry = {
  id: string;
  from: "customer" | "admin";
  text: string;
  date: string;
};

export type CustomerMessage = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  message: string;
  date: string;
  status: MessageStatus;
  thread: ThreadEntry[];
};

const KEY = "pso-customer-messages-v2";
const SESSION_KEY = "pso-support-session";
/** Fired whenever the store changes in THIS tab (the native `storage` event only
 *  fires in other tabs, so the widget also needs this to update instantly). */
export const MESSAGES_EVENT = "pso-messages-changed";

function read(): CustomerMessage[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CustomerMessage[]) : [];
  } catch {
    return [];
  }
}

function write(list: CustomerMessage[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(MESSAGES_EVENT));
  } catch {
    /* ignore */
  }
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;
}

/** Shared live store — every component using this hook stays in sync. */
export function useCustomerMessages() {
  const [messages, setMessages] = useState<CustomerMessage[]>(read);

  useEffect(() => {
    const sync = () => setMessages(read());
    window.addEventListener(MESSAGES_EVENT, sync);
    window.addEventListener("storage", sync);
    const poll = window.setInterval(sync, 1500);
    return () => {
      window.removeEventListener(MESSAGES_EVENT, sync);
      window.removeEventListener("storage", sync);
      window.clearInterval(poll);
    };
  }, []);

  const addMessage = (m: Omit<CustomerMessage, "id" | "date" | "status" | "thread">) => {
    const now = new Date().toISOString();
    const msg: CustomerMessage = {
      ...m,
      id: uid("MSG"),
      date: now,
      status: "new",
      thread: [{ id: uid("T"), from: "customer", text: m.message, date: now }],
    };
    write([msg, ...read()]);
    setMessages(read());
    return msg;
  };

  /** Customer adds another line to an existing conversation. */
  const addCustomerReply = (id: string, text: string) => {
    write(
      read().map((m) =>
        m.id === id
          ? {
              ...m,
              status: "new" as MessageStatus,
              thread: [...m.thread, { id: uid("T"), from: "customer" as const, text, date: new Date().toISOString() }],
            }
          : m,
      ),
    );
    setMessages(read());
  };

  /** Admin reply — lands straight in the customer's PSO Support chat. */
  const replyTo = (id: string, text: string) => {
    write(
      read().map((m) =>
        m.id === id
          ? {
              ...m,
              status: "replied" as MessageStatus,
              thread: [...m.thread, { id: uid("T"), from: "admin" as const, text, date: new Date().toISOString() }],
            }
          : m,
      ),
    );
    setMessages(read());
  };

  const markRead = (id: string) => {
    write(read().map((m) => (m.id === id ? { ...m, status: "read" as MessageStatus } : m)));
    setMessages(read());
  };

  const remove = (id: string) => {
    write(read().filter((m) => m.id !== id));
    setMessages(read());
  };

  const unread = messages.filter((m) => m.status === "new").length;

  return { messages, addMessage, addCustomerReply, replyTo, markRead, remove, unread };
}

/** The conversation id belonging to the visitor on this device. */
export function getSessionId(): string | null {
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setSessionId(id: string) {
  try {
    window.localStorage.setItem(SESSION_KEY, id);
  } catch {
    /* ignore */
  }
}
