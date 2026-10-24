import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import useFavorites from "../components/useFavorites.js";
import useFavoriteList from "../components/useFavoriteList.js";
import { steamImageCandidates } from "../components/dealUtils.js";

function Thumb({ images }) {
  const [idx, setIdx] = useState(0);
  const src = images?.[idx];
  if (!src) return <div className="fav-row-img" aria-hidden="true" />;
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      className="fav-row-img"
      onError={() => setIdx((i) => (i + 1 < images.length ? i + 1 : i))}
    />
  );
}

export default function Favorites() {
  const { favorites, toggle } = useFavorites();
  const byId = useFavoriteList(favorites);

  useEffect(() => {
    document.title = "Mes favoris — Check moi ça";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container-page flex-1 py-6 sm:py-8">
        <h1 className="text-strong mb-4 text-2xl font-bold">Mes favoris</h1>

        {favorites.length === 0 && (
          <p className="notice text-muted">
            Aucun favori pour le moment. Clique sur l’étoile d’une carte pour en ajouter.{" "}
            <Link to="/" className="underline">Retour aux offres</Link>
          </p>
        )}

        {favorites.length > 0 && byId === null && <p role="status" className="text-muted">Chargement des prix…</p>}

        {favorites.length > 0 && byId && (
          <ul className="fav-rows">
            {favorites.map((id) => {
              const d = byId[id];
              const title = d?.title ?? `Jeu Steam n° ${id}`;
              return (
                <li key={id} className="fav-row">
                  <Link to={`/steam/app/${id}`} className="fav-row-link">
                    <Thumb images={d?.images ?? steamImageCandidates(id)} />
                    <span className="fav-row-title">{title}</span>
                    <span className="fav-row-price">
                      {d?.discount && <span className="discount-badge">-{d.discount}%</span>}
                      <span className="price-lines">
                        {d?.oldPrice && <span className="price-old"><span className="sr-only">Ancien prix </span>{d.oldPrice}</span>}
                        <span className="price">{d?.price ?? "Prix indisponible"}</span>
                      </span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    className="btn btn-blue btn-sm"
                    aria-label={`Retirer des favoris — ${title}`}
                    onClick={() => toggle(id)}
                  >
                    Retirer
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
