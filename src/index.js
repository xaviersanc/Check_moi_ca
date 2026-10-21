import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./index.css";
import App from "./App";
import GameDetails from "./pages/GameDetails";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Terms, Privacy } from "./pages/Legal";
import Newsletter from "./pages/Newsletter";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container-page flex-1 py-10">
        <div className="notice">
          <p>Cette page n’existe pas.</p>
          <Link to="/" className="btn btn-green mt-4">Retour aux offres</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/steam/app/:appid" element={<GameDetails />} />
      <Route path="/conditions-utilisation" element={<Terms />} />
      <Route path="/politique-confidentialite" element={<Privacy />} />
      <Route path="/newsletter" element={<Newsletter />} />
      <Route path="*"element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
