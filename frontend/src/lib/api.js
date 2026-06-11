import { toast } from '../components/ui/sonner';

const DEFAULT_API_BASE_URL = 'http://localhost:3000';
const envApiBase = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = envApiBase && envApiBase !== 'undefined' ? envApiBase.replace(/\/$/, '') : DEFAULT_API_BASE_URL;

const buildUrl = (url) => {
  if (typeof url !== 'string') {
    throw new Error('API URL must be a string');
  }

  if (/^https?:\/\//.test(url)) {
    return url;
  }

  let normalizedUrl = url.replace(/^undefined\/+/, '/');

  if (normalizedUrl.startsWith('/') && API_BASE_URL.startsWith('/')) {
    return normalizedUrl.startsWith(API_BASE_URL)
      ? normalizedUrl
      : `${API_BASE_URL}${normalizedUrl}`;
  }

  if (normalizedUrl.startsWith('/')) {
    return `${API_BASE_URL}${normalizedUrl}`;
  }

  if (API_BASE_URL.startsWith('/')) {
    return `${API_BASE_URL}/${normalizedUrl}`;
  }

  return `${API_BASE_URL}/${normalizedUrl}`;
};

export async function apiFetch(url, { method = 'GET', body, headers = {}, showToast = true } = {}) {
  try {
    let finalHeaders = { ...headers };
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
      finalHeaders['Content-Type'] = 'application/json';
    }
    const res = await fetch(buildUrl(url), {
      method,
      headers: finalHeaders,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) {
        // Not authenticated is valid for /user/me; return null so auth context can treat as logged out.
        return null;
      }
      if (showToast) toast.error(data.message || 'Something went wrong');
      const error = new Error(data?.message || 'API error');
      error.status = res.status;
      throw error;
    }

    if (showToast && data?.message) toast.success(data.message);
    return data;
  } catch (err) {
    if (showToast) toast.error(err.message || 'Network error');
    throw err;
  }
} 