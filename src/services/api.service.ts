import { getToken, removeToken, isTokenExpired } from '@/utils/token.util';

const API_PREFIX = '/api';

function parseJsonSafe(text: string): unknown {
  let trimmed = text.trim();
  if (!trimmed) return trimmed;

  trimmed = trimmed.replace(/"hibernateLazyInitializer"\s*([}\]])/g, '"hibernateLazyInitializer":null$1');

  let startIndex = -1;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '[' || trimmed[i] === '{') {
      startIndex = i;
      break;
    }
  }

  if (startIndex === -1) return JSON.parse(trimmed);

  let depth = 0;
  let inString = false;
  let escapeNext = false;
  let endIndex = trimmed.length;

  for (let i = startIndex; i < trimmed.length; i++) {
    const char = trimmed[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (inString) {
      if (char === '\\') {
        escapeNext = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '[' || char === '{') {
      depth++;
    } else if (char === ']' || char === '}') {
      depth--;
      if (depth === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }

  const jsonPart = trimmed.slice(startIndex, endIndex);
  return JSON.parse(jsonPart);
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      const token = getToken();
      if (!token || isTokenExpired(token)) {
        removeToken();
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      throw new Error('Sesión expirada. Por favor inicia sesión de nuevo.');
    }

    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return parseJsonSafe(text) as T;
}

function getHeaders(requireAuth: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = token;
    }
  }

  return headers;
}

function extractTokenFromBody(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  for (const key of ['token', 'jwt', 'accessToken', 'access_token', 'authToken', 'authorization']) {
    if (typeof obj[key] === 'string' && (obj[key] as string).length > 20) {
      return obj[key] as string;
    }
  }
  return null;
}

export const api = {
  get: async <T>(url: string, requireAuth = false): Promise<T> => {
    const response = await fetch(`${API_PREFIX}${url}`, {
      method: 'GET',
      headers: getHeaders(requireAuth),
      cache: 'no-store',
    });
    return handleResponse<T>(response);
  },

  post: async <T>(url: string, body: unknown, requireAuth = false): Promise<T> => {
    const response = await fetch(`${API_PREFIX}${url}`, {
      method: 'POST',
      headers: getHeaders(requireAuth),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  put: async <T>(url: string, body: unknown, requireAuth = false): Promise<T> => {
    const response = await fetch(`${API_PREFIX}${url}`, {
      method: 'PUT',
      headers: getHeaders(requireAuth),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  del: async <T>(url: string, requireAuth = false): Promise<T> => {
    const response = await fetch(`${API_PREFIX}${url}`, {
      method: 'DELETE',
      headers: getHeaders(requireAuth),
    });
    return handleResponse<T>(response);
  },

  loginBasic: async (email: string, password: string): Promise<string> => {
    const basic = btoa(`${email}:${password}`);
    const response = await fetch(`${API_PREFIX}/auth/signin`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${basic}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Credenciales inválidas');
    }

    const fromHeader = response.headers.get('Authorization');
    if (fromHeader) {
      return fromHeader.startsWith('Bearer ') ? fromHeader.slice(7) : fromHeader;
    }

    const cloned = response.clone();
    try {
      const body = await cloned.json();
      const fromBody = extractTokenFromBody(body);
      if (fromBody) {
        return fromBody.startsWith('Bearer ') ? fromBody.slice(7) : fromBody;
      }
    } catch {}

    try {
      const text = await response.clone().text();
      if (text && text.length > 20 && text.includes('.')) {
        const trimmed = text.trim();
        return trimmed.startsWith('Bearer ') ? trimmed.slice(7) : trimmed;
      }
    } catch {}

    throw new Error('No se recibió token de autenticación. Verifica la configuración del backend.');
  },
};