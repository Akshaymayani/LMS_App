import type { AuthUser } from '@/types';

type AuthSession = {
  token: string | null | undefined;
  user: AuthUser | null | undefined;
};

export function normalizeAuthToken(token: string | null | undefined) {
  if (typeof token !== 'string') {
    return null;
  }

  const trimmedToken = token.trim();
  return trimmedToken.length > 0 ? trimmedToken : null;
}

export function normalizeAuthSession(session: AuthSession) {
  const token = normalizeAuthToken(session.token);

  if (!token || !session.user) {
    return {
      token: null,
      user: null,
    };
  }

  return {
    token,
    user: session.user,
  };
}

export function hasValidAuthSession(session: AuthSession) {
  const normalized = normalizeAuthSession(session);
  return Boolean(normalized.token && normalized.user);
}
