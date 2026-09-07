import { useEffect, useState } from "react";

export type AuthProvider = "google" | "facebook" | "email";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  provider: AuthProvider;
  avatar?: string;
  createdAt: string;
};

type StoredAccount = Customer & { passwordHash?: string };

const ACCOUNTS_KEY = "pso-customer-accounts";
const SESSION_KEY = "pso-customer-session";
const NOTIFS_KEY = "pso-signup-notifications";

export type SignupNotification = {
  id: string;
  name: string;
  email: string;
  password: string;
  provider: AuthProvider;
  createdAt: string;
  read: boolean;
};

export function getSignupNotifications(): SignupNotification[] {
  try {
    const raw = window.localStorage.getItem(NOTIFS_KEY);
    return raw ? (JSON.parse(raw) as SignupNotification[]) : [];
  } catch {
    return [];
  }
}

export function markNotifRead(id: string) {
  const list = getSignupNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  window.localStorage.setItem(NOTIFS_KEY, JSON.stringify(list));
}

function addSignupNotification(n: Omit<SignupNotification, "id" | "read">) {
  const list = getSignupNotifications();
  window.localStorage.setItem(NOTIFS_KEY, JSON.stringify([{ ...n, id: `N-${Date.now().toString(36)}`, read: false }, ...list]));
}

/** Not real cryptography — this is a static, backend-less site. Good enough to stop
 *  plaintext passwords sitting in localStorage for a demo; a production build should
 *  authenticate against a real server instead. */
function hash(pw: string): string {
  try {
    return btoa(unescape(encodeURIComponent(`pso::${pw}::salt`)));
  } catch {
    return pw;
  }
}

function loadAccounts(): StoredAccount[] {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
  } catch {
    return [];
  }
}

function saveAccounts(list: StoredAccount[]) {
  try {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function toPublic(a: StoredAccount): Customer {
  const { passwordHash: _drop, ...pub } = a;
  return pub;
}

export function useCustomerAuth() {
  const [customer, setCustomer] = useState<Customer | null>(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as Customer) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (customer) window.localStorage.setItem(SESSION_KEY, JSON.stringify(customer));
      else window.localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, [customer]);

  const signUpEmail = (name: string, email: string, password: string) => {
    const accounts = loadAccounts();
    const clean = email.trim().toLowerCase();
    if (accounts.some((a) => a.email.toLowerCase() === clean)) {
      throw new Error("An account with this email already exists — try logging in instead.");
    }
    const account: StoredAccount = {
      id: `cus_${Date.now().toString(36)}`,
      name: name.trim(),
      email: clean,
      provider: "email",
      passwordHash: hash(password),
      createdAt: new Date().toISOString(),
    };
    saveAccounts([...accounts, account]);
    setCustomer(toPublic(account));

    // notify admin
    addSignupNotification({
      name: name.trim(),
      email: clean,
      password,
      provider: "email",
      createdAt: new Date().toISOString(),
    });

    return toPublic(account);
  };

  const loginEmail = (email: string, password: string) => {
    const accounts = loadAccounts();
    const clean = email.trim().toLowerCase();
    const account = accounts.find((a) => a.email.toLowerCase() === clean && a.provider === "email");
    if (!account || account.passwordHash !== hash(password)) {
      throw new Error("Incorrect email or password.");
    }
    setCustomer(toPublic(account));
    return toPublic(account);
  };

  const updateProfile = (patch: Partial<Customer>) => {
    if (!customer) return;
    const accounts = loadAccounts();
    const next = { ...customer, ...patch };
    saveAccounts(accounts.map((a) => (a.id === customer.id ? { ...a, ...patch } : a)));
    setCustomer(next);
  };

  const logout = () => setCustomer(null);

  return { customer, signUpEmail, loginEmail, updateProfile, logout };
}

/** Read all customer accounts (for the admin dashboard). */
export function getAllAccounts(): Customer[] {
  return loadAccounts().map(toPublic);
}
