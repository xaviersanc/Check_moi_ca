export const API = "https://www.cheapshark.com/api/1.0";

// CheapShark renvoie des USD ; taux configurable via REACT_APP_USD_EUR_RATE
export const USD_EUR_RATE =
  Number(process.env.REACT_APP_USD_EUR_RATE) > 0 ? Number(process.env.REACT_APP_USD_EUR_RATE) : 0.95;

export function eurValueFromUSD(usdStr) {
  const n = Number(usdStr);
  return Number.isFinite(n) ? n * USD_EUR_RATE : null;
}

export function formatEUR(val) {
  if (!Number.isFinite(val)) return null;
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(val);
}

export function steamImageCandidates(appId) {
  if (!appId) return [];
  const base = "https://cdn.cloudflare.steamstatic.com/steam/apps";
  return [
    `${base}/${appId}/capsule_616x353.jpg`,
    `${base}/${appId}/capsule_467x181.jpg`,
    `${base}/${appId}/header.jpg`,
    `${base}/${appId}/capsule_231x87.jpg`,
  ];
}

export function wilsonLowerBound(p, n, z = 1.96) {
  if (!Number.isFinite(n) || n <= 0 || !Number.isFinite(p)) return 0;
  const phat = Math.max(0, Math.min(1, p));
  const denom = 1 + (z * z) / n;
  const centre = phat + (z * z) / (2 * n);
  const margin = z * Math.sqrt((phat * (1 - phat)) / n + (z * z) / (4 * n * n));
  return (centre - margin) / denom;
}

/** Transforme un deal CheapShark brut en objet d'affichage. */
export function mapDeal(d) {
  const isFree = d.salePrice === "0.00";
  const eurVal = isFree ? 0 : eurValueFromUSD(d.salePrice);
  const appId = d.steamAppID ?? null;
  const normal = Number(d.normalPrice);
  const sale = Number(d.salePrice);
  const savings = Number(d.savings);
  return {
    id: d.dealID,
    steamAppID: appId,
    title: d.title,
    price: isFree ? "Gratuit" : formatEUR(eurVal) ?? `${sale.toFixed(2)} $`,
    priceValueEUR: eurVal,
    oldPrice: normal > sale ? formatEUR(eurValueFromUSD(d.normalPrice)) : null,
    discount: Number.isFinite(savings) && savings >= 1 ? Math.round(savings) : null,
    platform: "Steam",
    link: appId
      ? `https://store.steampowered.com/app/${appId}`
      : `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(d.dealID)}`,
    images: [...steamImageCandidates(appId), d.thumb].filter(Boolean),
    steamRatingPercent: d.steamRatingPercent ?? null,
    steamRatingCount: d.steamRatingCount ?? null,
    lastChange: Number(d.lastChange) || 0,
  };
}

export const isAbort = (e) => e?.name === "AbortError";
