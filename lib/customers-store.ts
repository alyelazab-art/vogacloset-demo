// localStorage-backed "customer database" for the demo.
// Each entry pairs a User profile with a password (plain — demo only, no real auth).
// Session 3 wires the Gameball Customer API; this stays as the local source of truth
// for fake-auth, with Gameball synced as a side effect of signUp.

import type { User, Tier } from "./types";
import { LS_KEYS, readJSON, writeJSON } from "./storage";

export type CustomerRecord = {
  user: User;
  password: string;          // demo-only, never hashed
};

export function getAllCustomers(): CustomerRecord[] {
  return readJSON<CustomerRecord[]>(LS_KEYS.CUSTOMERS, []);
}

function saveAllCustomers(records: CustomerRecord[]): void {
  writeJSON(LS_KEYS.CUSTOMERS, records);
}

export function getCustomerByEmail(email: string): CustomerRecord | undefined {
  const normalized = email.trim().toLowerCase();
  return getAllCustomers().find((r) => r.user.email.toLowerCase() === normalized);
}

export function getCustomerById(id: string): CustomerRecord | undefined {
  return getAllCustomers().find((r) => r.user.id === id);
}

export type SignUpInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  birthday?: string;
  tier?: Tier;                // optional seed tier (used by pre-seeded demo accounts)
  id?: string;                // optional stable id (used by pre-seeded demo accounts)
};

export function createCustomer(input: SignUpInput): CustomerRecord {
  const existing = getCustomerByEmail(input.email);
  if (existing) {
    throw new Error("هذا البريد مسجّل بالفعل. سجّلي دخولك بدلًا من ذلك.");
  }
  const id = input.id ?? generateCustomerId();
  const user: User = {
    id,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || undefined,
    birthday: input.birthday || undefined,
    createdAt: new Date().toISOString(),
    tier: input.tier ?? "blue",
  };
  const record: CustomerRecord = { user, password: input.password };
  const all = getAllCustomers();
  all.push(record);
  saveAllCustomers(all);
  return record;
}

export function verifyCredentials(email: string, password: string): CustomerRecord | null {
  const rec = getCustomerByEmail(email);
  if (!rec) return null;
  if (rec.password !== password) return null;
  return rec;
}

export function updateCustomer(id: string, patch: Partial<User>): User | null {
  const all = getAllCustomers();
  const idx = all.findIndex((r) => r.user.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], user: { ...all[idx].user, ...patch } };
  saveAllCustomers(all);
  return all[idx].user;
}

function generateCustomerId(): string {
  // Short readable ID — easier to recognize in the Gameball dashboard when wired.
  const ts = Date.now().toString(36).slice(-6);
  const rand = Math.random().toString(36).slice(2, 6);
  return `voga-${ts}-${rand}`;
}
