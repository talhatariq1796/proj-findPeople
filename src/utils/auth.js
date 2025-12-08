const ACCESS_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const EXPIRES_AT_KEY = "expires_at";
const REFRESH_MARGIN_SECONDS = 60; // refresh 1 minute before expiry

export const storeSessionTokens = (session = {}) => {
  if (session.access_token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);
  }

  if (session.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
  }

  const expiresAt =
    session.expires_at ||
    (session.expires_in
      ? Math.floor(Date.now() / 1000) + Number(session.expires_in)
      : null);

  if (expiresAt) {
    localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
  }
};

export const getStoredSession = () => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const expiresAtRaw = localStorage.getItem(EXPIRES_AT_KEY);
  const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : null;

  return { accessToken, refreshToken, expiresAt };
};

export const clearSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
};

const isAccessTokenFresh = (expiresAt) => {
  if (!expiresAt) return true;
  const nowInSeconds = Date.now() / 1000;
  return expiresAt - REFRESH_MARGIN_SECONDS > nowInSeconds;
};

const callRefreshEndpoint = async (apiBaseUrl, refreshToken) => {
  const endpoints = `${apiBaseUrl}/api/auth/refresh`
  

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (response.ok) {
        return await response.json();
      }

      // If the endpoint exists but returns unauthorized, stop trying others
      if (response.status === 400 || response.status === 401) {
        return null;
      }
    } catch (err) {
      // Try the next endpoint option
      // eslint-disable-next-line no-console
      console.warn("Refresh token call failed", err);
    }
  }

  return null;
};

export const ensureFreshToken = async (apiBaseUrl) => {
  const { accessToken, refreshToken, expiresAt } = getStoredSession();

  if (!accessToken && !refreshToken) {
    return null;
  }

  if (accessToken && isAccessTokenFresh(expiresAt)) {
    return accessToken;
  }

  if (!refreshToken) {
    if (expiresAt && !isAccessTokenFresh(expiresAt)) {
      clearSession();
      return null;
    }
    return accessToken || null;
  }

  const refreshed = await callRefreshEndpoint(apiBaseUrl, refreshToken);

  const refreshedSession = refreshed?.session || refreshed;
  if (refreshedSession?.access_token) {
    storeSessionTokens(refreshedSession);
    return refreshedSession.access_token;
  }

  clearSession();
  return null;
};
