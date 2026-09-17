import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, ApiClientError } from './api';

describe('apiFetch', () => {
  afterEach(() => vi.restoreAllMocks());

  it('uses the same-origin transport and parses a JSON response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiFetch<{ ok: boolean }>('/api/session')).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith('/api/session', expect.objectContaining({ credentials: 'same-origin', method: 'GET' }));
  });

  it('preserves structured problem details for a conflict', async () => {
    const problem = { type: 'https://shopwave.dev/problems/cart_changed', title: 'Conflict', status: 409, code: 'CART_CHANGED', detail: 'Review the cart', instance: '/api/store/orders', traceId: 'trace', fieldErrors: [] };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(problem), { status: 409, headers: { 'content-type': 'application/problem+json' } })));

    const promise = apiFetch('/api/store/orders', { method: 'POST', body: '{}' });
    await expect(promise).rejects.toMatchObject({ status: 409, problem });
  });

  it('turns malformed successful JSON into an API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{broken', { status: 200 })));
    await expect(apiFetch('/api/session')).rejects.toBeInstanceOf(ApiClientError);
  });
});
