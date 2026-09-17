import { cookies } from 'next/headers';

export const SESSION_COOKIE = process.env.NODE_ENV === 'production' ? '__Host-shopwave_session' : 'shopwave_session';

export function backendUrl() {
  return (process.env.BACKEND_URL ?? 'http://localhost:8080').replace(/\/$/, '');
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 30,
  };
}

export function expiresAtFromToken(token: string) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return new Date(Date.now() + 30 * 60_000).toISOString();
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: number };
    return new Date((decoded.exp ?? Math.floor(Date.now() / 1000) + 1800) * 1000).toISOString();
  } catch {
    return new Date(Date.now() + 30 * 60_000).toISOString();
  }
}

export async function getSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function backendFetch(path: string, init: RequestInit = {}, token?: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  try {
    return await fetch(`${backendUrl()}${path}`, {
      ...init,
      headers,
      redirect: 'manual',
      cache: 'no-store',
      signal: init.signal ?? controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function backendJson<T>(path: string, init: RequestInit = {}, token?: string): Promise<{ response: Response; data?: T }> {
  const response = await backendFetch(path, init, token);
  const text = await response.text();
  let data: T | undefined;
  if (text) {
    try {
      data = JSON.parse(text) as T;
    } catch {
      data = undefined;
    }
  }
  return { response, data };
}
