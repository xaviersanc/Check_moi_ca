import { useEffect, useState } from "react";
import { API, isAbort, mapDeal } from "./dealUtils";

/** Prix actuel de chaque favori (en promo ou non). `null` pendant le chargement. */
export default function useFavoriteList(favorites) {
  const [byId, setById] = useState(null);
  const key = favorites.join(",");

  useEffect(() => {
    if (!key) {
      setById({});
      return;
    }
    const ctrl = new AbortController();
    setById(null);
    (async () => {
      try {
        const entries = await Promise.all(
          key.split(",").map(async (id) => {
            try {
              const res = await fetch(`${API}/deals?storeID=1&steamAppID=${encodeURIComponent(id)}`, {
                signal: ctrl.signal,
                headers: { Accept: "application/json" },
              });
              if (!res.ok) return [id, null];
              const json = await res.json();
              return [id, Array.isArray(json) && json[0] ? mapDeal(json[0]) : null];
            } catch (e) {
              if (isAbort(e)) throw e;
              return [id, null];
            }
          })
        );
        setById(Object.fromEntries(entries));
      } catch (e) {
        if (!isAbort(e)) setById({});
      }
    })();
    return () => ctrl.abort();
  }, [key]);

  return byId;
}
