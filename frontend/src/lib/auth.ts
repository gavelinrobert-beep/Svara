const TOKEN_KEY = 'svara_token';
const BUSINESS_KEY = 'svara_business';

export interface Business {
  id: string;
  name: string;
  email: string;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getBusiness(): Business | null {
  const raw = localStorage.getItem(BUSINESS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Business;
  } catch {
    return null;
  }
}

export function setBusiness(business: Business): void {
  localStorage.setItem(BUSINESS_KEY, JSON.stringify(business));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(BUSINESS_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}
