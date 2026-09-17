import { problemSchema, type ProblemDetails } from '@/contracts/shopwave.schema';

export class ApiClientError extends Error {
  readonly status: number;
  readonly problem?: ProblemDetails;

  constructor(status: number, message: string, problem?: ProblemDetails) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.problem = problem;
  }
}

function isMutation(method: string) {
  return !['GET', 'HEAD'].includes(method.toUpperCase());
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (isMutation(method)) {
    headers.set('Content-Type', 'application/json');
    headers.set('X-ShopWave-Request', '1');
  }
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(path, { ...init, method, headers, credentials: 'same-origin', signal: init.signal ?? controller.signal });
    const raw = await response.text();
    const data = raw ? JSON.parse(raw) as unknown : undefined;
    if (!response.ok) {
      const problem = problemSchema.safeParse(data);
      if (response.status === 401 && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('shopwave:auth-expired'));
      throw new ApiClientError(response.status, problem.success ? problem.data.detail : 'No se pudo completar la solicitud', problem.success ? problem.data : undefined);
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    if (error instanceof SyntaxError) throw new ApiClientError(502, 'El servidor devolvió una respuesta inválida');
    if (error instanceof DOMException && error.name === 'AbortError') throw new ApiClientError(504, 'La solicitud tardó demasiado');
    if (error instanceof TypeError) throw new ApiClientError(502, 'No se pudo contactar al servicio');
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function getErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado') {
  if (error instanceof ApiClientError) return error.message;
  return error instanceof Error ? error.message : fallback;
}
