interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

/**
 * API client for Next.js API routes (same origin).
 * Automatically attaches the Supabase auth token.
 */
export async function nextApiClient<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options;

  // Get the Supabase access token from the browser client
  const { createSupabaseBrowser } = await import('./supabase-browser');
  const supabase = createSupabaseBrowser();
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`/api${path}`, {
    ...rest,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
