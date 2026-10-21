import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4">
        <p className="text-muted text-sm">
          © {new Date().getFullYear()} Check moi ça · Données Steam et SteamSpy, non affilié à Valve.
        </p>
        <nav aria-label="Informations légales">
          <ul className="footer-links">
            <li><Link to="/conditions-utilisation">Conditions d’utilisation</Link></li>
            <li><Link to="/politique-confidentialite">Politique de confidentialité</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
