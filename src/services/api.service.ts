const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function getHeaders(requireAuth: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = localStorage.getItem('shopwave_token');
    if (token) {
      headers['Authorization'] = token;
    }
  }

  return headers;
}

export const api = {
  get: async <T>(url: string, requireAuth = false): Promise<T> => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'GET',
      headers: getHeaders(requireAuth),
    });
    return handleResponse<T>(response);
  },

  post: async <T>(url: string, body: unknown, requireAuth = false): Promise<T> => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: getHeaders(requireAuth),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  put: async <T>(url: string, body: unknown, requireAuth = false): Promise<T> => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'PUT',
      headers: getHeaders(requireAuth),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  del: async <T>(url: string, requireAuth = false): Promise<T> => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'DELETE',
      headers: getHeaders(requireAuth),
    });
    return handleResponse<T>(response);
  },

  loginBasic: async (email: string, password: string): Promise<string> => {
    const basic = btoa(`${email}:${password}`);
    const response = await fetch(`${BASE_URL}/auth/signin`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${basic}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Credenciales inválidas');
    }

    const jwt = response.headers.get('Authorization');
    if (!jwt) {
      throw new Error('No se recibió token de autenticación');
    }
    return jwt;
  },
};