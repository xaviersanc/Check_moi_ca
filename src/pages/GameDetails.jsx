import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import { fetchSteamSpyApp } from "../components/steamspy";
import { fetchSteamStoreDetails } from "../components/steamStore";
import { USD_EUR_RATE, formatEUR, isAbort } from "../components/dealUtils";

const nf = new Intl.NumberFormat("fr-FR");

function toMinutesLabel(min) {
  const n = Number(min || 0);
  return `${nf.format(n)} min${n >= 60 ? ` (${(n / 60).toFixed(1)} h)` : ""}`;
}

function stripHtml(html) {
  if (!html) return "";
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
  return text.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function priceToEUR({ store, spy }) {
  const po = store?.price_overview;
  if (po && typeof po.final === "number") {
    const eur = po.currency === "EUR" ? po.final / 100 : (po.final / 100) * USD_EUR_RATE;
    const initial =
      typeof po.initial === "number" && po.initial > po.final
        ? po.currency === "EUR"
          ? po.initial / 100
          : (po.initial / 100) * USD_EUR_RATE
        : null;
    return { priceText: formatEUR(eur), oldText: initial ? formatEUR(initial) : null, discount: po.discount_percent || 0 };
  }
  if (store?.is_free) return { priceText: "Gratuit", oldText: null, discount: 0 };
  if (spy && typeof spy.price === "number" && spy.price > 0) {
    return { priceText: formatEUR((spy.price / 100) * USD_EUR_RATE), oldText: null, discount: Number(spy.discount || 0) };
  }
  return { priceText: "—", oldText: null, discount: 0 };
}

function Shell({ children }) {
  return (
    <div className="min-h-screen">
      <Header />
      {children}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="stat-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default function GameDetails() {
  const { appid } = useParams();
  const [spy, setSpy] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const steamPage = useMemo(() => (appid ? `https://store.steampowered.com/app/${appid}` : null), [appid]);
  const headerImg = useMemo(
    () => (appid ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg` : null),
    [appid]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    setSpy(null);
    setStore(null);
    (async () => {
      const [spyRes, storeRes] = await Promise.allSettled([
        fetchSteamSpyApp(appid, { signal: ctrl.signal }),
        fetchSteamStoreDetails(appid, { signal: ctrl.signal }),
      ]);
      if (ctrl.signal.aborted) return; // fiche différente ou page quittée : on ignore
      if (spyRes.status === "rejected" && storeRes.status === "rejected") {
        const reason = [spyRes.reason, storeRes.reason].find((r) => r && !isAbort(r));
        setError(reason?.message || "Échec des requêtes");
      } else {
        setSpy(spyRes.status === "fulfilled" ? spyRes.value || null : null);
        setStore(storeRes.status === "fulfilled" ? storeRes.value || null : null);
      }
      setLoading(false);
    })();
    return () => ctrl.abort();
  }, [appid, attempt]);

  if (loading) {
    return (
      <Shell>
        <div className="container-page py-8" aria-busy="true">
          <p role="status" className="sr-only">Chargement de la fiche…</p>
          <div className="skeleton mb-6 h-8 w-1/2" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="skeleton aspect-[460/215] w-full lg:col-span-2" />
            <div className="skeleton h-64 w-full" />
          </div>
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="container-page py-10">
          <div role="alert" className="notice notice-error">
            <p>Impossible de charger la fiche ({error}).</p>
            <div className="mt-4 flex justify-center gap-3">
              <button type="button" className="btn btn-blue" onClick={retry}>Réessayer</button>
              <Link to="/" className="btn btn-green">Retour aux offres</Link>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  if (!spy && !store) {
    return (
      <Shell>
        <div className="container-page py-10">
          <div className="notice">
            <p>Aucune donnée pour ce jeu.</p>
            <Link to="/" className="btn btn-green mt-4">Retour aux offres</Link>
          </div>
        </div>
      </Shell>
    );
  }

  const name = store?.name ?? spy?.name ?? "—";
  const publisher = store?.publishers?.join(", ") || spy?.publisher || "—";
  const developer = store?.developers?.join(", ") || spy?.developer || "—";
  const shortDesc = stripHtml(store?.short_description);
  const { priceText, oldText, discount } = priceToEUR({ store, spy });
  const topTags = spy?.tags && typeof spy.tags === "object"
    ? Object.entries(spy.tags).sort((a, b) => b[1] - a[1]).slice(0, 12)
    : [];

  return (
    <Shell>
      <div className="hero">
        <div className="container-page py-6">
          <Link to="/" className="text-sm">← Retour aux offres</Link>
          <h1 className="text-strong mt-2 text-2xl font-bold sm:text-3xl">{name}</h1>
        </div>
      </div>

      <main className="container-page grid grid-cols-1 gap-6 py-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {headerImg && (
            <img
              src={headerImg}
              alt={`Illustration de ${name}`}
              className="h-auto w-full rounded border"
              style={{ borderColor: "var(--border)" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}

          {topTags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tags les plus votés" style={{ listStyle: "none", padding: 0 }}>
              {topTags.map(([tag, votes]) => (
                <li key={tag}>
                  <span className="tag" title={`${nf.format(votes)} votes`}>{tag}</span>
                </li>
              ))}
            </ul>
          )}

          {shortDesc && (
            <section className="panel mt-5">
              <h2>Description</h2>
              <p className="whitespace-pre-line">{shortDesc}</p>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:col-span-1">
          <section className="panel" aria-labelledby="buy-h">
            <h2 id="buy-h">Acheter</h2>
            <div className="flex items-center justify-between gap-3">
              <div className="price-block">
                {discount > 0 && <span className="discount-badge">-{discount}%</span>}
                <span className="price-lines">
                  {oldText && <span className="price-old"><span className="sr-only">Ancien prix </span>{oldText}</span>}
                  <span className="price" style={{ fontSize: "1.25rem" }}>{priceText}</span>
                </span>
              </div>
            </div>
            <a href={steamPage} target="_blank" rel="noreferrer" className="btn btn-green mt-4 w-full">
              Ouvrir sur Steam<span className="sr-only"> (nouvel onglet)</span> ↗
            </a>
          </section>

          <section className="panel" aria-labelledby="info-h">
            <h2 id="info-h">Informations</h2>
            <dl style={{ margin: 0 }}>
              <Row label="Développeur">{developer}</Row>
              <Row label="Éditeur">{publisher}</Row>
            </dl>
          </section>

          <section className="panel" aria-labelledby="stats-h">
            <h2 id="stats-h">Statistiques</h2>
            <dl style={{ margin: 0 }}>
              <Row label="Propriétaires estimés">{spy?.owners ?? "—"}</Row>
              <Row label="Pic joueurs (hier)">{nf.format(Number(spy?.ccu ?? 0))}</Row>
              <Row label="Temps moyen total">{toMinutesLabel(spy?.average_forever)}</Row>
              <Row label="Temps moyen 2 semaines">{toMinutesLabel(spy?.average_2weeks)}</Row>
              <Row label="Rang (avis)">{spy?.score_rank || "—"}</Row>
            </dl>
          </section>
        </aside>
      </main>
    </Shell>
  );
}
