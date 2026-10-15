import { useEffect, useState } from "react";
import { API, isAbort, mapDeal, wilsonLowerBound } from "./dealUtils";

/** Meilleures offres Steam sous `maxPrice` (USD côté API), triées par fiabilité des avis. */
export default function useSteamDealsUnder(maxPrice) {
  const [deals, setDeals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const url = `${API}/deals?storeID=1&upperPrice=${encodeURIComponent(maxPrice)}&pageSize=60`;
        const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const scored = (Array.isArray(json) ? json : []).map((d) => {
          const count = Number(d.steamRatingCount ?? 0);
          const percent = Number(d.steamRatingPercent ?? 0) / 100;
          return { raw: d, count, dealRating: Number(d.dealRating ?? 0), score: wilsonLowerBound(percent, count) };
        });
        scored.sort((a, b) => b.score - a.score || b.count - a.count || b.dealRating - a.dealRating);

        setDeals(scored.map(({ raw }) => mapDeal(raw)));
        setLoading(false);
      } catch (e) {
        if (isAbort(e)) return; // requête remplacée ou composant démonté : ne pas toucher à l'état
        setError(e.message || "Erreur");
        setDeals(null);
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [maxPrice]);

  return { deals, loading, error };
}
