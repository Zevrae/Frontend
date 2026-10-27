const TOKEN_KEY = 'zevrae_auth_token';
const LEGACY_TOKEN_KEY = 'zevrae_token';

export const tokenUtils = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
  },
  
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(LEGACY_TOKEN_KEY, token);
  },
  
  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem('zevrae_user');
  }
};
