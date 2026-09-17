import { NextResponse } from 'next/server';
import { backendFetch, getSessionCookieOptions, SESSION_COOKIE } from '@/lib/server/backend';
import { validOrigin } from '@/lib/server/bff';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!validOrigin(request)) return NextResponse.json({ code: 'ORIGIN_REJECTED', detail: 'Origen no permitido' }, { status: 403 });
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(SESSION_COOKIE, '', { ...getSessionCookieOptions(), maxAge: 0 });
  if (!token) return response;
  try {
    const upstream = await backendFetch('/api/v1/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }, token);
    if (!upstream.ok && upstream.status !== 401) return NextResponse.json({ code: 'LOGOUT_UNCONFIRMED', detail: 'La sesión local se eliminó, pero la revocación remota no fue confirmada' }, { status: 502, headers: response.headers });
    return response;
  } catch {
    return NextResponse.json({ code: 'LOGOUT_UNCONFIRMED', detail: 'La sesión local se eliminó, pero la revocación remota no fue confirmada' }, { status: 502, headers: response.headers });
  }
}
