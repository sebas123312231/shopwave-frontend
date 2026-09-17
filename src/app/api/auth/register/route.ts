import { NextResponse } from 'next/server';
import { registerSchema, userSchema } from '@/contracts/shopwave.schema';
import { backendFetch } from '@/lib/server/backend';
import { validOrigin } from '@/lib/server/bff';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!validOrigin(request)) return NextResponse.json({ code: 'ORIGIN_REJECTED', detail: 'Origen no permitido' }, { status: 403 });
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') return NextResponse.json({ code: 'JSON_REQUIRED', detail: 'Se requiere application/json' }, { status: 415 });
  const body = await request.json().catch(() => null);
  const input = registerSchema.safeParse(body);
  if (!input.success) return NextResponse.json({ code: 'VALIDATION_ERROR', detail: 'Revisa los datos del registro' }, { status: 400 });
  try {
    const upstream = await backendFetch('/api/v1/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input.data) });
    const data = await upstream.json().catch(() => undefined) as unknown;
    if (!upstream.ok) return NextResponse.json(data ?? { code: 'UPSTREAM_ERROR', detail: 'No se pudo crear la cuenta' }, { status: upstream.status });
    const user = userSchema.safeParse(data);
    if (!user.success) return NextResponse.json({ code: 'UPSTREAM_INVALID', detail: 'Respuesta inválida del servicio' }, { status: 502 });
    return NextResponse.json(user.data, { status: 201 });
  } catch {
    return NextResponse.json({ code: 'UPSTREAM_UNAVAILABLE', detail: 'No se pudo contactar al servicio' }, { status: 502 });
  }
}
