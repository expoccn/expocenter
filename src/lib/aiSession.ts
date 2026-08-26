const AI_SESSION_STORAGE_KEY = 'expo-center-norte-ai-session-v2';
const SESSION_PATTERN = /^[-_A-Za-z0-9]{8,120}$/;

function newSessionId() {
  const random = typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
  return `expo-ai-${random}`.slice(0, 120);
}

export function getOrCreateAiSessionId() {
  if (typeof window === 'undefined') return 'expo-ai-ssr-session';

  const current = window.sessionStorage.getItem(AI_SESSION_STORAGE_KEY) || '';
  if (SESSION_PATTERN.test(current)) return current;

  const sessionId = newSessionId();
  window.sessionStorage.setItem(AI_SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}
