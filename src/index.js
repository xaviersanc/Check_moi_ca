import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./index.css";
import App from "./App";
import GameDetails from "./pages/GameDetails";
import Header from "./components/Header";

function NotFound() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container-page py-10">
        <div className="notice">
          <p>Cette page n’existe pas.</p>
          <Link to="/" className="btn btn-green mt-4">Retour aux offres</Link>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/steam/app/:appid" element={<GameDetails />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
