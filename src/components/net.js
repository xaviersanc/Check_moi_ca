export function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchWithTimeout(url, { timeoutMs = 8000, signal, ...opts } = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  const onAbort = () => ctrl.abort();
  if (signal) {
    if (signal.aborted) ctrl.abort();
    else signal.addEventListener("abort", onAbort, { once: true });
  }
  try {
    return await fetch(url, {
      ...opts,
      signal: ctrl.signal,
      headers: { Accept: "application/json", ...(opts?.headers || {}) },
    });
  } finally {
    clearTimeout(id);
    signal?.removeEventListener("abort", onAbort);
  }
}

/**
 * Essaie chaque URL dans l'ordre. Par URL : jusqu'à `attempts` essais avec backoff,
 * mais uniquement pour les erreurs transitoires (réseau, timeout, 429, 5xx).
 * Un 4xx (hors 429) passe directement à l'URL suivante. Une annulation (signal) interrompt tout.
 */
export async function getJsonResilient(
  urls,
  { timeoutMs = 8000, attempts = 3, backoffs = [0, 600, 1500], signal, ...opts } = {}
) {
  let lastErr = null;
  for (const url of urls) {
    for (let i = 0; i < attempts; i++) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      try {
        if (backoffs[i]) await delay(backoffs[i]);
        const res = await fetchWithTimeout(url, { timeoutMs, signal, ...opts });
        if (!res.ok) {
          const err = new Error(`HTTP ${res.status}`);
          err.retryable = res.status === 429 || res.status >= 500;
          throw err;
        }
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          // Réponse non JSON (ex. index.html servi par un rewrite SPA) : passer à l'URL suivante
          const err = new Error("Réponse non JSON");
          err.retryable = false;
          throw err;
        }
      } catch (e) {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
        lastErr = e;
        if (e.retryable === false) break;
      }
    }
  }
  throw lastErr || new Error("Network error");
}
