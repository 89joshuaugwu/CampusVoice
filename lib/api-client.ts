import { auth } from "./firebase";

export async function authedFetch(url: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (user) {
    const token = await user.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(url, { ...options, headers });
  return res;
}

export async function authedJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await authedFetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Request failed.");
  return data as T;
}
