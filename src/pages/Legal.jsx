import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

// À renseigner avant mise en production : adresse de contact de l'éditeur.
const CONTACT_EMAIL = "contact@example.com";
const LAST_UPDATE = "21 octobre 2026";

function LegalPage({ title, children }) {
  useEffect(() => {
    document.title = `${title} — Check moi ça`;
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container-page legal flex-1 py-8">
        <Link to="/" className="text-sm">Retour aux offres</Link>
        <h1 className="text-strong mt-2 text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="text-muted mt-1 text-sm">Dernière mise à jour : {LAST_UPDATE}</p>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export function Terms() {
  return (
    <LegalPage title="Conditions d’utilisation">
      <section>
        <h2>1. Objet</h2>
        <p>
          « Check moi ça » est un site gratuit qui présente des offres de jeux vidéo vendus sur Steam, avec
          des avis, des tags et des statistiques de jeu. En utilisant le site, vous acceptez les présentes conditions.
        </p>
      </section>
      <section>
        <h2>2. Nature du service</h2>
        <p>
          Le site est un comparateur d’information : il ne vend aucun jeu. Les achats se font sur Steam,
          selon les conditions de Valve. Le site n’est ni affilié à, ni approuvé par Valve Corporation ;
          Steam et les noms de jeux sont des marques de leurs propriétaires respectifs.
        </p>
      </section>
      <section>
        <h2>3. Exactitude des informations</h2>
        <p>
          Les prix, réductions, avis et statistiques proviennent de services tiers (Steam, SteamSpy) et peuvent
          être incomplets, retardés ou erronés. Les prix en dollars sont convertis en euros à un taux indicatif.
          Le prix qui fait foi est celui affiché sur Steam au moment de l’achat.
        </p>
      </section>
      <section>
        <h2>4. Utilisation acceptable</h2>
        <p>
          Vous vous engagez à ne pas perturber le service, à ne pas tenter d’y accéder de façon abusive ou
          automatisée (extraction massive, surcharge des API) et à ne pas l’utiliser à des fins illégales.
        </p>
      </section>
      <section>
        <h2>5. Propriété intellectuelle</h2>
        <p>
          Le code et la mise en page du site sont protégés. Les images, titres et descriptions des jeux
          appartiennent à leurs éditeurs et à Valve.
        </p>
      </section>
      <section>
        <h2>6. Responsabilité</h2>
        <p>
          Le site est fourni « en l’état », sans garantie de disponibilité ni d’exactitude. Dans les limites
          permises par la loi, l’éditeur ne saurait être tenu responsable d’un préjudice lié à l’usage du
          site ou à un achat effectué sur un site tiers.
        </p>
      </section>
      <section>
        <h2>7. Liens externes</h2>
        <p>Le site renvoie vers Steam. L’éditeur n’est pas responsable du contenu des sites tiers.</p>
      </section>
      <section>
        <h2>8. Modification et droit applicable</h2>
        <p>
          Ces conditions peuvent évoluer ; la date de mise à jour figure en haut de page. Elles sont soumises au
          droit français. Pour toute question, voir notre{" "}
          <Link to="/politique-confidentialite">politique de confidentialité</Link> ou écrire à{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalPage>
  );
}

export function Privacy() {
  return (
    <LegalPage title="Politique de confidentialité">
      <section>
        <h2>1. En résumé</h2>
        <p>
          Le site n’a pas de compte utilisateur, ni publicité, ni outil d’analyse. Sauf si vous vous abonnez
          à la newsletter Discord (voir section 3 bis), nous ne collectons aucune donnée personnelle.
          Aucun cookie de suivi n’est utilisé.
        </p>
      </section>
      <section>
        <h2>2. Données stockées sur votre appareil</h2>
        <p>
          Votre choix de thème (clair ou sombre) est enregistré dans le stockage local de votre navigateur
          (clé <code>theme</code>). Cette donnée reste sur votre appareil, n’est jamais transmise et peut être
          supprimée à tout moment dans les réglages de votre navigateur. Elle est strictement nécessaire au
          confort d’affichage et ne requiert donc pas de consentement.
        </p>
      </section>
      <section>
        <h2>3. Recherches et consultation</h2>
        <p>
          Les titres que vous recherchez et les fiches que vous ouvrez sont transmis à nos fonctions serveur,
          qui interrogent Steam et SteamSpy pour récupérer les offres. Ces requêtes ne sont pas associées à
          votre identité et nous ne les conservons pas.
        </p>
      </section>
      <section>
        <h2>3 bis. Newsletter Discord</h2>
        <p>
          La page Newsletter vous permet de recevoir des messages privés du bot Discord Coin Coin. Pour cela,
          vous vous connectez via Discord (scope <code>identify</code>) : nous lisons votre identifiant Discord
          afin de vérifier votre identité, et le conservons tant que vous restez abonné(e). Il n’est utilisé que
          pour vous envoyer la newsletter, jamais cédé à des tiers. Un cookie technique strictement nécessaire
          (signé, valable une heure) maintient votre connexion le temps de la visite. Vous pouvez vous désabonner
          à tout moment sur la page Newsletter ; votre identifiant est alors effacé. Les identifiants sont
          stockés chez Upstash (Redis) et transmis au bot lors d’un envoi.
        </p>
      </section>
      <section>
        <h2>4. Hébergeur et services tiers</h2>
        <p>
          Le site est hébergé par Vercel Inc., qui peut traiter votre adresse IP et des journaux techniques
          pour assurer la sécurité et le fonctionnement du service. Les images des jeux sont chargées depuis
          les serveurs de Steam (Valve), qui peuvent également voir votre adresse IP. Si vous ouvrez Steam,
          sa propre politique de confidentialité s’applique.
        </p>
      </section>
      <section>
        <h2>5. Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition
          et de limitation du traitement de vos données. Hors newsletter, nous ne conservons pas de données vous
          concernant ; ces droits portent alors sur les journaux techniques de l’hébergeur. Pour la newsletter,
          le désabonnement efface votre identifiant. Vous pouvez
          aussi saisir la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noreferrer">cnil.fr<span className="sr-only"> (nouvel onglet)</span></a>).
        </p>
      </section>
      <section>
        <h2>6. Contact et modifications</h2>
        <p>
          Pour toute question : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Cette politique peut
          être mise à jour ; la date figure en haut de page. Voir aussi les{" "}
          <Link to="/conditions-utilisation">conditions d’utilisation</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
