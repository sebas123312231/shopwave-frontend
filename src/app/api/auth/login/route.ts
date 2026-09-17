import { NextResponse } from 'next/server';
import { loginSchema, tokenResponseSchema } from '@/contracts/shopwave.schema';
import { backendFetch, getSessionCookieOptions, SESSION_COOKIE } from '@/lib/server/backend';
import { validOrigin } from '@/lib/server/bff';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!validOrigin(request)) return NextResponse.json({ code: 'ORIGIN_REJECTED', detail: 'Origen no permitido' }, { status: 403 });
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') return NextResponse.json({ code: 'JSON_REQUIRED', detail: 'Se requiere application/json' }, { status: 415 });
  const body = await request.json().catch(() => null);
  const input = loginSchema.safeParse(body);
  if (!input.success) return NextResponse.json({ code: 'VALIDATION_ERROR', detail: 'Revisa correo y contraseña' }, { status: 400 });
  try {
    const upstream = await backendFetch('/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input.data) });
    const data = await upstream.json().catch(() => undefined) as unknown;
    if (!upstream.ok) return NextResponse.json(data ?? { code: 'UPSTREAM_ERROR', detail: 'No se pudo iniciar sesión' }, { status: upstream.status });
    const token = tokenResponseSchema.safeParse(data);
    if (!token.success) return NextResponse.json({ code: 'UPSTREAM_INVALID', detail: 'Respuesta inválida del servicio' }, { status: 502 });
    const response = NextResponse.json({ user: token.data.user, expiresAt: token.data.expiresAt }, { status: 200 });
    response.cookies.set(SESSION_COOKIE, token.data.accessToken, { ...getSessionCookieOptions(), maxAge: Math.max(1, Math.floor((new Date(token.data.expiresAt).getTime() - Date.now()) / 1000)) });
    return response;
  } catch {
    return NextResponse.json({ code: 'UPSTREAM_UNAVAILABLE', detail: 'No se pudo contactar al servicio' }, { status: 502 });
  }
}
