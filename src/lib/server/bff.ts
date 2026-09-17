import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { problemSchema } from '@/contracts/shopwave.schema';
import { backendFetch, getSessionCookieOptions, SESSION_COOKIE } from './backend';

const MAX_BODY_BYTES = 64 * 1024;
const PUBLIC_GETS = new Set(['products', 'products/facets', 'categories']);

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

function requestOriginAllowed(request: Request) {
  const origin = request.headers.get('origin');
  const expected = process.env.APP_ORIGIN ?? 'http://localhost:3000';
  if (!origin || origin === 'null' || origin !== expected) return false;
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  return true;
}

function normalizePath(segments: string[]) {
  return segments.filter(Boolean).join('/').replace(/^v1\//, '');
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function allow(method: string, path: string) {
  if (method === 'GET') return PUBLIC_GETS.has(path) || /^products\/[0-9a-f-]{36}$/i.test(path) || path === 'me' || path === 'me/addresses' || path === 'cart' || path === 'orders' || /^orders\/[0-9a-f-]{36}$/.test(path) || path === 'admin/summary' || path === 'admin/products' || /^admin\/products\/[0-9a-f-]{36}$/.test(path) || path === 'admin/orders' || /^admin\/orders\/[0-9a-f-]{36}$/.test(path);
  if (method === 'POST') return path === 'cart/items' || path === 'orders' || path === 'admin/products';
  if (method === 'PATCH') return path === 'me' || /^cart\/items\/[0-9a-f-]{36}$/.test(path) || /^admin\/products\/[0-9a-f-]{36}\/archive$/.test(path) || /^admin\/orders\/[0-9a-f-]{36}\/status$/.test(path);
  if (method === 'PUT') return /^admin\/products\/[0-9a-f-]{36}$/.test(path);
  if (method === 'DELETE') return /^cart\/items\/[0-9a-f-]{36}$/.test(path);
  return false;
}

function invalidPath(path: string) {
  return path.split('/').some((part) => part.length > 100 || (part.includes('-') && part.length >= 30 && !isUuid(part)));
}

export async function handleStore(request: Request, segments: string[]) {
  const method = request.method.toUpperCase();
  const path = normalizePath(segments);
  if (!path || invalidPath(path) || !allow(method, path)) return json(404, { code: 'NOT_FOUND', detail: 'Ruta no encontrada' });
  if (method !== 'GET' && !requestOriginAllowed(request)) return json(403, { code: 'ORIGIN_REJECTED', detail: 'Origen no permitido' });
  if (method !== 'GET' && request.headers.get('content-type')?.split(';')[0] !== 'application/json') return json(415, { code: 'JSON_REQUIRED', detail: 'Se requiere application/json' });
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) return json(413, { code: 'BODY_TOO_LARGE', detail: 'Solicitud demasiado grande' });

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const isPublic = PUBLIC_GETS.has(path) || /^products\/[0-9a-f-]{36}$/i.test(path);
  if (!isPublic && !token) return json(401, { code: 'UNAUTHENTICATED', detail: 'Inicia sesión para continuar' });

  const headers = new Headers();
  headers.set('Accept', 'application/json');
  if (method !== 'GET') headers.set('Content-Type', 'application/json');
  if (method === 'POST' && path === 'orders') {
    const idempotency = request.headers.get('idempotency-key');
    if (!idempotency) return json(400, { code: 'IDEMPOTENCY_KEY_REQUIRED', detail: 'Falta Idempotency-Key' });
    headers.set('Idempotency-Key', idempotency);
  }
  const body = method === 'GET' || method === 'DELETE' ? undefined : await request.text();
  if (body && new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    return json(413, { code: 'BODY_TOO_LARGE', detail: 'Solicitud demasiado grande' });
  }
  let upstream: Response;
  try {
    upstream = await backendFetch(`/api/v1/${path}${new URL(request.url).search}`, { method, headers, body }, token);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return json(504, { code: 'UPSTREAM_TIMEOUT', detail: 'El servicio tardó demasiado' });
    return json(502, { code: 'UPSTREAM_UNAVAILABLE', detail: 'No se pudo contactar al servicio' });
  }
  if (upstream.status >= 300 && upstream.status < 400) return json(502, { code: 'UPSTREAM_REDIRECT', detail: 'Respuesta inválida del servicio' });
  const responseHeaders = new Headers();
  const contentType = upstream.headers.get('content-type');
  if (contentType) responseHeaders.set('content-type', contentType);
  if (upstream.status === 401) cookieStore.delete(SESSION_COOKIE);
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export function clearSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', { ...getSessionCookieOptions(), maxAge: 0 });
  return response;
}

export function validOrigin(request: Request) {
  return requestOriginAllowed(request);
}

export function parseUpstreamProblem(data: unknown) {
  const parsed = problemSchema.safeParse(data);
  return parsed.success ? parsed.data : undefined;
}
