import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'shopwave_token';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  const rawToken = token.startsWith('Bearer ') ? token.slice(7) : token;
  localStorage.setItem(TOKEN_KEY, rawToken);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const rawToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwtDecode<{ exp?: number }>(rawToken);
    if (decoded.exp && typeof decoded.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    }
    return false;
  } catch {
    return true;
  }
};

export const decodeToken = (token: string): Record<string, unknown> => {
  const rawToken = token.startsWith('Bearer ') ? token.slice(7) : token;
  return jwtDecode(rawToken);
};