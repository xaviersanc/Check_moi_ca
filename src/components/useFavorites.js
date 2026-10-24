import { useCallback, useEffect, useState } from "react";

const KEY = "favorite-games";

function load() {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

/** Favoris (steamAppID) persistés dans le localStorage, synchronisés entre onglets. */
export default function useFavorites() {
  const [favorites, setFavorites] = useState(load);

  useEffect(() => {
    const onStorage = (e) => e.key === KEY && setFavorites(load());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((appId) => {
    const id = String(appId);
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // stockage indisponible : le favori reste valable pour la session
      }
      return next;
    });
  }, []);

  return { favorites, toggle };
}
