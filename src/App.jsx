import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "./components/Header.jsx";
import useSteamDealsUnder from "./components/useSteamDealsUnder.js";
import useSteamDealsByTitle from "./components/useSteamDealsByTitle.js";

const PRICE_LIMITS = [5, 15];

function DealImage({ images, title }) {
  const [idx, setIdx] = useState(0);
  const src = images?.[idx];
  if (!src) return <div className="game-img" aria-hidden="true" />;
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      className="game-img"
      onError={() => setIdx((i) => (i + 1 < images.length ? i + 1 : i))}
    />
  );
}

function DealCTA({ deal }) {
  return deal.steamAppID ? (
    <Link to={`/steam/app/${deal.steamAppID}`} className="btn btn-blue btn-sm" aria-label={`Voir la fiche — ${deal.title}`}>
      Voir la fiche
    </Link>
  ) : (
    <a href={deal.link} target="_blank" rel="noreferrer" className="btn btn-blue btn-sm" aria-label={`Voir l’offre — ${deal.title} (nouvel onglet)`}>
      Voir l’offre ↗
    </a>
  );
}

function Rating({ percent, count }) {
  const n = Number(count);
  if (!n || percent == null) return null;
  return (
    <p className="rating mt-1">
      <strong>{percent} %</strong> d’avis positifs · {new Intl.NumberFormat("fr-FR").format(n)} avis
    </p>
  );
}

function CardsGrid({ items }) {
  return (
    <ul className="cards-grid" style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {items.map((g) => (
        <li key={g.id}>
          <article className="game-card h-full">
            <div className="game-media">
              <DealImage images={g.images} title={g.title} />
              <span className="platform-chip">{g.platform || "Steam"}</span>
            </div>
            <div className="flex flex-1 flex-col justify-between gap-3 p-3">
              <div>
                <h3 className="game-title line-clamp-2">{g.title}</h3>
                <Rating percent={g.steamRatingPercent} count={g.steamRatingCount} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="price-block">
                  {g.discount && <span className="discount-badge">-{g.discount}%</span>}
                  <span className="price-lines">
                    {g.oldPrice && <span className="price-old"><span className="sr-only">Ancien prix </span>{g.oldPrice}</span>}
                    <span className="price">{g.price}</span>
                  </span>
                </div>
                <DealCTA deal={g} />
              </div>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

function SkeletonGrid() {
  return (
    <div className="cards-grid" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} className="game-card">
          <div className="game-media skeleton" style={{ borderRadius: 0 }} />
          <div className="space-y-3 p-3">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(15);
  const search = useSteamDealsByTitle(query);
  const browse = useSteamDealsUnder(maxPrice);

  const reset = () => {
    setQ("");
    setQuery("");
  };

  const active = query ? search : browse;
  const { loading, error, deals } = active;

  let under = [];
  let over = [];
  if (query && Array.isArray(deals)) {
    under = deals.filter((d) => Number(d.priceValueEUR) <= maxPrice);
    over = deals.filter((d) => !(Number(d.priceValueEUR) <= maxPrice));
  }

  return (
    <div className="min-h-screen">
      <a href="#resultats" className="skip-link">Aller aux résultats</a>
      <Header onHome={reset} />

      <section className="hero">
        <div className="container-page py-8 text-center sm:py-12">
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl xl:text-5xl">Offres de jeux Steam</h1>
          <p className="text-muted mx-auto mt-2 max-w-xl">
            Les jeux les mieux notés à petit prix, avec avis, tags et statistiques de jeu.
          </p>

          <form
            className="mx-auto mt-6 max-w-2xl"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(q.trim());
            }}
          >
            <div className="search">
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un jeu par titre"
                aria-label="Rechercher un jeu"
                autoComplete="off"
              />
              {(q || query) && (
                <button type="button" className="search-clear" onClick={reset} aria-label="Effacer la recherche">
                  ✕
                </button>
              )}
              <button type="submit" className="btn btn-green" style={{ borderRadius: 0 }}>
                Rechercher
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <span className="text-muted text-sm" id="price-filter-label">Budget</span>
            <div className="segmented" role="group" aria-labelledby="price-filter-label">
              {PRICE_LIMITS.map((p) => (
                <button key={p} type="button" aria-pressed={maxPrice === p} onClick={() => setMaxPrice(p)}>
                  {`≤ ${p} €`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main id="resultats" className="container-page py-6 sm:py-8" aria-busy={loading}>
        {loading && (
          <>
            <p role="status" className="sr-only">Chargement des offres…</p>
            <SkeletonGrid />
          </>
        )}

        {!loading && error && (
          <div role="alert" className="notice notice-error">
            Impossible de charger les offres ({error}).
          </div>
        )}

        {!loading && !error && !query && Array.isArray(deals) && (
          <>
            <h2 className="text-strong mb-4 text-xl font-semibold">{`Meilleures offres à moins de ${maxPrice} €`}</h2>
            {deals.length === 0 ? <p className="notice text-muted">Aucune offre pour le moment.</p> : <CardsGrid items={deals} />}
          </>
        )}

        {!loading && !error && query && Array.isArray(deals) && (
          <>
            <h2 className="text-strong mb-4 text-xl font-semibold">
              {`Résultats pour « ${query} » à moins de ${maxPrice} €`}
            </h2>
            {under.length === 0 ? <p className="notice text-muted">Aucun résultat sous {maxPrice} €.</p> : <CardsGrid items={under} />}

            <h2 className="text-strong mb-4 mt-10 border-t pt-8 text-xl font-semibold" style={{ borderColor: "var(--border)" }}>
              {`Autres résultats (au-dessus de ${maxPrice} €)`}
            </h2>
            {over.length === 0 ? <p className="notice text-muted">Aucun autre résultat.</p> : <CardsGrid items={over} />}
          </>
        )}
      </main>
    </div>
  );
}
