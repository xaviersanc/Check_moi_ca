import { useEffect, useState } from "react";
import { API, isAbort, mapDeal } from "./dealUtils";

export default function useSteamDealsByTitle(title) {
  const [deals, setDeals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = (title || "").trim();
    if (!q) {
      setDeals(null);
      setLoading(false);
      setError(null);
      return;
    }

    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const params = new URLSearchParams({ storeID: "1", pageSize: "60", title: q });
        const res = await fetch(`${API}/deals?${params.toString()}`, {
          signal: ctrl.signal,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setDeals((Array.isArray(json) ? json : []).map(mapDeal));
        setLoading(false);
      } catch (e) {
        if (isAbort(e)) return; // une nouvelle recherche a pris le relais
        setError(e.message || "Erreur");
        setDeals(null);
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [title]);

  return { deals, loading, error };
}
