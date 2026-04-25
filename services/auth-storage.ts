import type { AuthPayload, AuthUser } from '@/types';
import * as SecureStore from 'expo-secure-store';
import { normalizeAuthSession } from '@/utils/auth-session';

const TOKEN_KEY = 'lms.auth.token';
const USER_KEY = 'lms.auth.user';

export async function getStoredSession(): Promise<{
  token: string | null;
  user: AuthUser | null;
}> {
  const [token, rawUser] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);

  let user: AuthUser | null = null;

  if (rawUser) {
    try {
      user = JSON.parse(rawUser) as AuthUser;
    } catch {
      user = null;
    }
  }

  const session = normalizeAuthSession({ token, user });

  if (!session.token && (token || rawUser)) {
    await clearStoredSession();
  }

  return session;
}

export async function persistSession(payload: AuthPayload) {
  const session = normalizeAuthSession({
    token: payload.accessToken,
    user: payload.user,
  });

  if (!session.token || !session.user) {
    await clearStoredSession();
    return;
  }

  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEY, session.token),
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user)),
  ]);
}

export async function clearStoredSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}
