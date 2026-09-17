import { cookies } from 'next/headers';
import { userSchema, type Session } from '@/contracts/shopwave.schema';
import { backendJson, expiresAtFromToken, SESSION_COOKIE } from './backend';

export async function getServerSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const { response, data } = await backendJson<unknown>('/api/v1/me', {}, token);
  const user = userSchema.safeParse(data);
  if (!response.ok || !user.success) return null;
  return { user: user.data, expiresAt: expiresAtFromToken(token) };
}
