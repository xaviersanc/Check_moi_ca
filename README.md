````markdown
# Check moi ça — Installation & Mise en route

Projet React configuré avec **Tailwind CSS** pour la mise en page et un point d’entrée fonctionnel.

---

## 1. Prérequis

- **Node.js ≥ 16**
- **npm ≥ 8**

Vérification :
```bash
node -v
npm -v
````

---

## 2. Structure du projet

```
Check_moi_ca/
├─ public/
│  └─ index.html
├─ src/
│  ├─ App.jsx
│  ├─ index.js
│  ├─ index.css
│  └─ ...
├─ package.json
├─ package-lock.json
├─ tailwind.config.js
```

---

# Check_moi_ca

Application React qui agrège des données publiques Steam afin d’afficher une fiche de jeu complète : prix (via Steam Store ou SteamSpy), description courte, tags populaires et statistiques publiques (propriétaires estimés, pic de joueurs, temps de jeu moyen).

## Pitch — quoi / pourquoi / pour qui

* **Quoi** : affichage d’une fiche de jeu Steam en combinant les données de la Steam Store et de SteamSpy.
* **Pourquoi** : obtenir rapidement les informations clés d’un jeu (prix, tags, statistiques) sans ouvrir plusieurs services.
* **Pour qui** : joueurs, curateurs de promotions, développeurs front cherchant un exemple d’intégration d’APIs publiques.

## Stack technique

* React (JSX) avec React Router
* JavaScript (ESModules)
* Tailwind CSS + Pico.css pour le style
* create-react-app (`react-scripts`)

Fichiers principaux :

* `src/index.js` — point d’entrée et gestion du routing
* `src/App.jsx` — page d’accueil (liste et recherche de jeux)
* `src/pages/GameDetails.jsx` — page de détail d’un jeu (agrégation Steam Store + SteamSpy)
* `src/components/steamStore.js` — wrapper pour l’API Steam Store
* `src/components/steamspy.js` — wrapper pour l’API SteamSpy
* `src/components/net.js` — utilitaires réseau (timeouts, retries, backoff)

## Architecture & routing

* **Routes principales** :

  1. `/` — page d’accueil (`App.jsx`)
  2. `/steam/app/:appid` — fiche d’un jeu (`GameDetails.jsx`)

* **Flow pour `GameDetails`** :

  1. Deux appels parallèles :

     * `fetchSteamStoreDetails(appid)` (prix, description, éditeur/développeur)
     * `fetchSteamSpyApp(appid)` (statistiques, tags, données d’usage)
  2. Fusion des résultats : l’application privilégie Steam Store pour les métadonnées, et SteamSpy pour les statistiques et tags.
  3. Affichage final : image header CDN, nom, développeur/éditeur, prix, réduction, tags et données d’activité.

## Endpoints externes appelés

1. **Steam Store — appdetails**

   * URL : `https://store.steampowered.com/api/appdetails?appids={APPID}&l=french`
   * Documentation : [store.steampowered.com/api](https://store.steampowered.com/api/)
   * Utilisé par : `src/components/steamStore.js`

2. **SteamSpy — appdetails**

   * URL : `https://steamspy.com/api.php?request=appdetails&appid={APPID}`
   * Documentation : [steamspy.com/api.php](https://steamspy.com/api.php)
   * Utilisé par : `src/components/steamspy.js`

3. **AllOrigins (proxy public, fallback CORS)**

   * URL : `https://api.allorigins.win/raw?url={ENCODED_URL}`
   * Documentation : [allorigins.win](https://allorigins.win/)
   * Utilisé en secours si le navigateur bloque les appels directs (CORS).

4. **CDN & page Steam**

   * Page : `https://store.steampowered.com/app/{APPID}`
   * Image : `https://cdn.cloudflare.steamstatic.com/steam/apps/{APPID}/header.jpg`

**Remarque :** les endpoints Steam Store et SteamSpy utilisés ici sont publics et ne nécessitent pas de clé.
Les appels à la *Steam Web API* (comme `ISteamUserStats`) nécessiteraient une clé d’API Steam : [https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)

---

## Comment lancer le projet

1. **Installer les dépendances**

   ```bash
   npm install
   ```

2. **(Optionnel) Créer un fichier `.env`**

   ```text
   # .env (exemple)
   REACT_APP_USD_EUR_RATE=0.95
   ```

3. **Lancer le serveur de développement**

   ```bash
   npm start
   ```

   L’application démarre sur [http://localhost:3000](http://localhost:3000)

---

## Notes CORS / Proxy

* **En développement** : `package.json` contient un champ `proxy` vers `https://steamspy.com` pour faciliter les appels relatifs.
* **En production (Vercel)** : utilisation de routes API serverless dans `/api` qui agissent comme proxy pour contourner les CORS.
* Les requêtes problématiques (CORS) passent automatiquement par `allorigins.win` en dernier recours.

### Routes API Vercel

* `/api/steamspy?appid=XXX` — Proxy serverless pour SteamSpy
* `/api/steamstore?appid=XXX` — Proxy serverless pour Steam Store API

Ces routes sont automatiquement déployées comme fonctions serverless sur Vercel.

---

## Debug & problèmes connus

* Si `react-scripts` dans `package-lock.json` a pour valeur `^0.0.0`, remplacer manuellement par :

  ```json
  "react-scripts": "^5.0.1"
  ```

  puis relancer :

  ```bash
  npm install
  ```

* Les fonctions de `src/components/net.js` gèrent automatiquement timeout et retries pour stabiliser les appels réseau.

---

## Exemples d’usage

* Lancer : `npm start`
* Accéder à un jeu en local : [http://localhost:3000/steam/app/570](http://localhost:3000/steam/app/570)

---

## Améliorations possibles

* Ajouter un filtrage par prix, genre ou note Steam.
* Intégrer une galerie d’images et des liens vers d’autres magasins.
* Ajouter des tests unitaires (ex. : `getJsonResilient`).
* Implémenter un cache local (IndexedDB / localStorage).

---

Dernière mise à jour : **2025-11-06**

