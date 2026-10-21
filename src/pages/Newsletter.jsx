import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const BOT_INVITE =
  "https://discord.com/oauth2/authorize?client_id=1187813645888012338&integration_type=1&scope=applications.commands";
const API = "/api/newsletter";

async function call(action, post = false) {
  const res = await fetch(`${API}?action=${action}`, post
    ? { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}", credentials: "same-origin" }
    : { credentials: "same-origin" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function Newsletter() {
  const [params] = useSearchParams();
  const [me, setMe] = useState(null); // null = chargement
  const [error, setError] = useState(params.get("erreur") ? "La connexion avec Discord a échoué, réessaie." : "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Newsletter Discord — Check moi ça";
    call("me").then(setMe).catch(() => setError("Le service est indisponible pour le moment."));
  }, []);

  const toggle = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const { subscribed } = await call(me.subscribed ? "unsubscribe" : "subscribe", true);
      setMe((m) => ({ ...m, subscribed }));
    } catch {
      setError("Action impossible pour le moment, réessaie.");
    } finally {
      setBusy(false);
    }
  }, [me]);

  const logout = async () => {
    await call("logout", true).catch(() => {});
    setMe({ loggedIn: false });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container-page legal flex-1 py-8">
        <Link to="/" className="text-sm">← Retour aux offres</Link>
        <h1 className="text-strong mt-2 text-2xl font-bold sm:text-3xl">Newsletter Discord</h1>
        <p className="text-muted mt-2">
          Reçois en message privé, de la part du bot <strong>Coin Coin</strong>, les sélections d’offres et
          nouveautés que je publie. Pas de rythme fixe, pas de publicité, désinscription en un clic.
        </p>

        {error && <div role="alert" className="notice notice-error mt-4">{error}</div>}

        <section className="mt-6">
          <h2>1. Ajoute le bot</h2>
          <p>
            Discord n’autorise le bot à t’écrire que si tu l’as ajouté à ton compte (installation « utilisateur », aucun serveur requis) ou partages un serveur avec lui.{" "}
            <a href={BOT_INVITE} target="_blank" rel="noreferrer">
              Ajouter Coin Coin<span className="sr-only"> (nouvel onglet)</span>
            </a>
            . Vérifie aussi que tes réglages de confidentialité autorisent les messages privés.
          </p>
        </section>

        <section>
          <h2>2. {me?.loggedIn ? "Ton abonnement" : "Connecte-toi avec Discord"}</h2>
          {me === null && !error && <p className="text-muted" role="status">Chargement…</p>}

          {me && !me.loggedIn && (
            <>
              <p>
                La connexion sert uniquement à connaître ton identifiant Discord, pour que personne ne puisse
                inscrire quelqu’un d’autre. Aucun autre accès à ton compte n’est demandé.
              </p>
              <a href={`${API}?action=login`} className="btn btn-green mt-3">Se connecter avec Discord</a>
            </>
          )}

          {me?.loggedIn && (
            <>
              <p>
                Connecté en tant que <strong>{me.name}</strong>.{" "}
                {me.subscribed ? "Tu es abonné(e) à la newsletter." : "Tu n’es pas abonné(e)."}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button type="button" className={`btn ${me.subscribed ? "btn-blue" : "btn-green"}`} onClick={toggle} disabled={busy}>
                  {me.subscribed ? "Me désabonner" : "M’abonner"}
                </button>
                <button type="button" className="header-btn" onClick={logout}>Se déconnecter</button>
              </div>
            </>
          )}
        </section>

        <section>
          <h2>Données</h2>
          <p>
            Seul ton identifiant Discord est conservé, le temps de ton abonnement. Détails dans la{" "}
            <Link to="/politique-confidentialite">politique de confidentialité</Link>.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
