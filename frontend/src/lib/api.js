import { toast } from '../components/ui/sonner';

export async function apiFetch(url, { method = 'GET', body, headers = {}, showToast = true } = {}) {
  try {
    let finalHeaders = { ...headers };
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
      finalHeaders['Content-Type'] = 'application/json';
    }
    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (showToast) toast.error(data.message || 'Something went wrong');
      throw new Error(data.message || 'API error');
    }
    if (showToast && data.message) toast.success(data.message);
    return data;
  } catch (err) {
    if (showToast) toast.error(err.message || 'Network error');
    throw err;
  }
} 