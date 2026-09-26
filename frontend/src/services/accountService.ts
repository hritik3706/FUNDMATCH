import { readJson, writeJson } from "@/lib/storage";
import type { AppNotification, ApplicationStatus, TrackedApplication, User } from "@/lib/types";

const USERS_KEY = "ps41.users";
const SESSION_KEY = "ps41.session";
const SAVED_KEY = "ps41.saved";
const APPS_KEY = "ps41.applications";
const NOTES_KEY = "ps41.notifications";
const PREFS_KEY = "ps41.notificationPrefs";

export type NotificationPreferences = {
  schemeUpdates: boolean;
  deadlineReminders: boolean;
  applicationUpdates: boolean;
};

const defaultPreferences: NotificationPreferences = {
  schemeUpdates: true,
  deadlineReminders: true,
  applicationUpdates: true,
};

type StoredUser = User & { passwordHash: string };

async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function users() {
  return readJson<StoredUser[]>(USERS_KEY, []);
}

export function currentUser() {
  return readJson<User | null>(SESSION_KEY, null);
}

export async function signUp(input: { name: string; email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const existing = users();
  if (existing.some((user) => user.email === email)) {
    throw new Error("An account with this email already exists. Sign in instead.");
  }
  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email,
    passwordHash: await hashPassword(input.password),
  };
  writeJson(USERS_KEY, [...existing, user]);
  const session: User = { id: user.id, name: user.name, email: user.email };
  writeJson(SESSION_KEY, session);
  return session;
}

export async function signIn(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const match = users().find((user) => user.email === email);
  if (!match || match.passwordHash !== (await hashPassword(input.password))) {
    throw new Error("Those credentials do not match an account on this device.");
  }
  const session: User = { id: match.id, name: match.name, email: match.email };
  writeJson(SESSION_KEY, session);
  return session;
}

export function signOut() {
  writeJson(SESSION_KEY, null);
}

export async function updateAccount(input: { name?: string; email?: string }) {
  const session = currentUser();
  if (!session) throw new Error("Sign in to update your account.");
  const all = users();
  const index = all.findIndex((user) => user.id === session.id);
  if (index < 0) throw new Error("This account is not on this device.");
  const email = input.email?.trim().toLowerCase();
  if (email && all.some((user) => user.email === email && user.id !== session.id)) {
    throw new Error("An account with this email already exists.");
  }
  const next = { ...all[index] };
  if (input.name?.trim()) next.name = input.name.trim();
  if (email) next.email = email;
  all[index] = next;
  writeJson(USERS_KEY, all);
  const updated: User = { id: next.id, name: next.name, email: next.email };
  writeJson(SESSION_KEY, updated);
  return updated;
}

export async function changePassword(input: { currentPassword: string; nextPassword: string }) {
  const session = currentUser();
  if (!session) throw new Error("Sign in to change your password.");
  if (input.nextPassword.length < 8) throw new Error("Use a password of at least 8 characters.");
  const all = users();
  const index = all.findIndex((user) => user.id === session.id);
  if (index < 0) throw new Error("This account is not on this device.");
  if (all[index].passwordHash !== (await hashPassword(input.currentPassword))) {
    throw new Error("The current password does not match.");
  }
  all[index] = { ...all[index], passwordHash: await hashPassword(input.nextPassword) };
  writeJson(USERS_KEY, all);
}

export function savedSchemeIds() {
  return readJson<string[]>(SAVED_KEY, []);
}

export function toggleSaved(schemeId: string) {
  const current = savedSchemeIds();
  const next = current.includes(schemeId) ? current.filter((id) => id !== schemeId) : [...current, schemeId];
  writeJson(SAVED_KEY, next);
  return next;
}

export function applications() {
  return readJson<TrackedApplication[]>(APPS_KEY, []);
}

export function trackApplication(input: { schemeId: string; schemeName: string; sourceUrl: string | null }) {
  const current = applications();
  const existing = current.find((item) => item.schemeId === input.schemeId);
  if (existing) return existing;
  const created: TrackedApplication = {
    id: crypto.randomUUID(),
    schemeId: input.schemeId,
    schemeName: input.schemeName,
    status: "NOT_STARTED",
    updatedAt: new Date().toISOString(),
    sourceUrl: input.sourceUrl,
  };
  writeJson(APPS_KEY, [created, ...current]);
  addNotification({
    title: "Application tracking started",
    body: `${input.schemeName} is now on your application list.`,
    category: "application",
    href: "/applications",
  });
  return created;
}

export function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const next = applications().map((item) =>
    item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item,
  );
  writeJson(APPS_KEY, next);
  return next;
}

export function notifications() {
  return readJson<AppNotification[]>(NOTES_KEY, []);
}

export function loadNotifications() {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") return notifications();
  const raw = window.localStorage.getItem(NOTES_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Notifications could not be loaded.");
  return parsed as AppNotification[];
}

export function notificationPreferences() {
  return { ...defaultPreferences, ...readJson<Partial<NotificationPreferences>>(PREFS_KEY, {}) };
}

export function saveNotificationPreferences(preferences: NotificationPreferences) {
  writeJson(PREFS_KEY, preferences);
  return preferences;
}

function notificationAllowed(category: AppNotification["category"]) {
  const preferences = notificationPreferences();
  if (category === "scheme") return preferences.schemeUpdates;
  if (category === "application") return preferences.applicationUpdates;
  return true;
}

export function addNotification(input: Omit<AppNotification, "id" | "createdAt" | "read">) {
  const current = notifications();
  if (!notificationAllowed(input.category)) return current;
  const next: AppNotification[] = [
    { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString(), read: false },
    ...current,
  ];
  writeJson(NOTES_KEY, next);
  return next;
}

export function markNotificationRead(id: string) {
  const next = notifications().map((item) => (item.id === id ? { ...item, read: true } : item));
  writeJson(NOTES_KEY, next);
  return next;
}

export function markAllNotificationsRead() {
  const next = notifications().map((item) => ({ ...item, read: true }));
  writeJson(NOTES_KEY, next);
  return next;
}
