import { NextResponse } from 'next/server';
import { userSchema } from '@/contracts/shopwave.schema';
import { backendFetch, expiresAtFromToken, SESSION_COOKIE } from '@/lib/server/backend';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ code: 'UNAUTHENTICATED', detail: 'No hay sesión activa' }, { status: 401 });
  try {
    const upstream = await backendFetch('/api/v1/me', {}, token);
    const data = await upstream.json().catch(() => undefined) as unknown;
    if (!upstream.ok) {
      if (upstream.status === 401) cookieStore.delete(SESSION_COOKIE);
      return NextResponse.json(data ?? { code: 'UNAUTHENTICATED', detail: 'La sesión expiró' }, { status: upstream.status });
    }
    const user = userSchema.safeParse(data);
    if (!user.success) return NextResponse.json({ code: 'UPSTREAM_INVALID', detail: 'Respuesta inválida del servicio' }, { status: 502 });
    return NextResponse.json({ user: user.data, expiresAt: expiresAtFromToken(token) });
  } catch {
    return NextResponse.json({ code: 'UPSTREAM_UNAVAILABLE', detail: 'No se pudo verificar la sesión' }, { status: 502 });
  }
}
