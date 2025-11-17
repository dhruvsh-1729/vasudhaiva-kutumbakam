/* Client-side auth helper: centralizes token storage, logout flow, and 401 handling. */
type HeadersInitType = HeadersInit | undefined;

export type AuthenticatedFetchInit = RequestInit & {
  skipAuthHeader?: boolean;
};

const isBrowser = typeof window !== 'undefined';
let interceptorAttached = false;
let originalFetchRef: typeof fetch | null = null;

const getRequestUrl = (input: RequestInfo | URL): string => {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
};

const shouldAttachAuthHeader = (url: string): boolean => {
  if (!isBrowser) return false;
  if (url.startsWith('http')) {
    try {
      const parsed = new URL(url);
      return parsed.origin === window.location.origin;
    } catch {
      return false;
    }
  }
  return url.startsWith('/');
};

const parseAuthError = async (response: Response) => {
  try {
    return await response.clone().json();
  } catch {
    return null;
  }
};

export const clientAuth = {
  getToken: (): string | null => {
    if (!isBrowser) return null;
    return localStorage.getItem('vk_token');
  },

  getUser: (): any | null => {
    if (!isBrowser) return null;
    const userStr = localStorage.getItem('vk_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setSession: (user: any, token: string): void => {
    if (!isBrowser) return;
    localStorage.setItem('vk_token', token);
    localStorage.setItem('vk_user', JSON.stringify(user));
  },

  clearSession: (): void => {
    if (!isBrowser) return;
    localStorage.removeItem('vk_token');
    localStorage.removeItem('vk_user');
  },

  isAuthenticated: (): boolean => {
    return !!clientAuth.getToken() && !!clientAuth.getUser();
  },

  logout: (redirectTo = '/login'): void => {
    if (!isBrowser) return;
    clientAuth.clearSession();
    window.location.replace(redirectTo);
  },

  handleUnauthorized: (reason?: string): void => {
    const params = new URLSearchParams();
    if (reason) params.set('reason', reason);
    const target = `/logout${params.toString() ? `?${params.toString()}` : ''}`;
    clientAuth.logout(target);
  },

  attachInterceptor: (): void => {
    if (!isBrowser || interceptorAttached) return;
    interceptorAttached = true;

    originalFetchRef = window.fetch.bind(window);
    const baseFetch = originalFetchRef;

    window.fetch = async (input: RequestInfo | URL, init?: AuthenticatedFetchInit): Promise<Response> => {
      const token = clientAuth.getToken();
      const url = getRequestUrl(input);

      const headers = new Headers((init?.headers as HeadersInitType) || {});
      if (token && !init?.skipAuthHeader && shouldAttachAuthHeader(url) && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const response = await baseFetch(input, { ...init, headers });

      if (response.status === 401) {
        const data = await parseAuthError(response);
        const message = data?.message || 'Your session has expired. Please log in again.';
        const forceLogout = data?.forceLogout !== false; // Default to forcing logout on 401.
        if (forceLogout) {
          clientAuth.handleUnauthorized(message);
        }
      }

      return response;
    };
  },

  authFetch: async (input: RequestInfo | URL, init?: AuthenticatedFetchInit): Promise<Response> => {
    if (isBrowser) {
      clientAuth.attachInterceptor();
    }
    const token = clientAuth.getToken();
    const headers = new Headers((init?.headers as HeadersInitType) || {});
    const url = getRequestUrl(input);

    if (token && shouldAttachAuthHeader(url) && !init?.skipAuthHeader) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const baseFetch = originalFetchRef || fetch;
    const response = await baseFetch(input, { ...init, headers });

    if (response.status === 401) {
      const data = await parseAuthError(response);
      const message = data?.message || 'Your session has expired. Please log in again.';
      const forceLogout = data?.forceLogout !== false;
      if (forceLogout) {
        clientAuth.handleUnauthorized(message);
      }
    }

    return response;
  },
};
