import { useEffect, useState } from "react";
import { API, isAbort, mapDeal } from "./dealUtils";

/** Offres Steam des favoris : promos en premier (rabais le plus récent d'abord), puis les autres. */
export default function useFavoriteDeals(favorites) {
  const [deals, setDeals] = useState([]);
  const key = favorites.join(",");

  useEffect(() => {
    if (!key) {
      setDeals([]);
      return;
    }
    const ctrl = new AbortController();
    (async () => {
      try {
        // une requête par jeu : l'API ne filtre qu'un seul steamAppID à la fois
        const results = await Promise.all(
          key.split(",").map(async (id) => {
            try {
              const res = await fetch(`${API}/deals?storeID=1&steamAppID=${encodeURIComponent(id)}`, {
                signal: ctrl.signal,
                headers: { Accept: "application/json" },
              });
              if (!res.ok) return [];
              const json = await res.json();
              return Array.isArray(json) ? json.slice(0, 1) : [];
            } catch (e) {
              if (isAbort(e)) throw e;
              return [];
            }
          })
        );
        const all = results.flat().map(mapDeal);
        all.sort((a, b) => Boolean(b.discount) - Boolean(a.discount) || b.lastChange - a.lastChange);
        setDeals(all);
      } catch (e) {
        if (!isAbort(e)) setDeals([]);
      }
    })();
    return () => ctrl.abort();
  }, [key]);

  return deals;
}
