import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") || "dark"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* stockage indisponible : le choix vaut pour la session */
    }
  };
  return [theme, toggle];
}

export default function Header({ onHome, children, below }) {
  const [theme, toggle] = useTheme();
  const next = theme === "dark" ? "clair" : "sombre";

  return (
    <header className="site-header">
      <nav className="container-page flex items-center justify-between gap-3 py-2" aria-label="Navigation principale">
        <Link to="/" className="brand" onClick={onHome}>
          Check moi ça
        </Link>
        <div className="flex items-center gap-2">
          {children}
          <Link to="/favoris" className="header-btn" title="Mes favoris">
            <span>Favoris</span>
          </Link>
          <button
            type="button"
            className="header-btn"
            onClick={toggle}
            aria-label={`Passer au thème ${next}`}
            title={`Thème ${next}`}
          >
            <span>{theme === "dark" ? "Clair" : "Sombre"}</span>
          </button>
        </div>
      </nav>
      {below}
    </header>
  );
}
