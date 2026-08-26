const SESSION_KEY = 'expo-center-norte-access-session';
export const AUTH_EXPIRED_EVENT = 'expo-center-norte-auth-expired';

function readStorage(storage: Storage | undefined) {
  if (!storage) return '';
  try {
    return storage.getItem(SESSION_KEY) || '';
  } catch {
    return '';
  }
}

export function getAccessToken() {
  if (typeof window === 'undefined') return '';
  return readStorage(window.sessionStorage) || readStorage(window.localStorage);
}

export function setAccessToken(token: string, remember = false) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(SESSION_KEY);
    (remember ? window.localStorage : window.sessionStorage).setItem(SESSION_KEY, token);
  } catch {
    // A sessão permanece apenas em memória caso o storage do navegador esteja bloqueado.
  }
}

export function clearAccessToken() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Sem ação adicional necessária.
  }
}

export function notifyAuthExpired() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}
