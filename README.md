# Check moi ça

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![Create React App](https://img.shields.io/badge/Create_React_App-5.0.1-09D3AC?logo=createreactapp&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![PostCSS](https://img.shields.io/badge/PostCSS-8-DD3A0A?logo=postcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-serverless-5FA04E?logo=nodedotjs&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-d%C3%A9ploiement-000000?logo=vercel&logoColor=white)
![Steam](https://img.shields.io/badge/Steam-Store_API-171A21?logo=steam&logoColor=white)
![License](https://img.shields.io/badge/Licence-MIT-blue)

L’application recense les jeux Steam les moins coûteux et centralise les informations nécessaires pour décider rapidement si un titre vaut l’achat. Elle affiche, en plus du prix, des données d’activité comme le temps de jeu médian sur les deux dernières semaines, l’estimation du nombre de joueurs récents et les tags dominants. Ces éléments permettent d’évaluer en un coup d’œil la popularité actuelle, la tendance d’usage et l’intérêt global du jeu, sans avoir à consulter plusieurs sites ou outils externes.

## Fonctionnalités

* Meilleures offres Steam à petit prix, classées par fiabilité des avis (borne basse de Wilson).
* Filtre de budget **≤ 5 €** / **≤ 15 €** (les prix USD de CheapShark sont convertis en euros).
* Recherche d’un jeu par titre, avec séparation des résultats dans / hors budget.
* Fiche détaillée : description, éditeurs, prix, promotions, tags, temps de jeu médian et estimation des joueurs récents.
* Thème sombre / clair et affichage responsive (ordinateur et mobile).

## Auteur

Projet réalisé par **Xavier SANCHEZ** ([@xaviersanc](https://github.com/xaviersanc)).


## Stack technique

| Technologie                                       | Rôle                                      |
| ------------------------------------------------- | ----------------------------------------- |
| React 18 (create-react-app 5)                     | Framework SPA                             |
| JavaScript (ES6+)                                 | Logique applicative                       |
| React Router DOM 7                                | Routing                                   |
| Tailwind CSS + variables CSS (thèmes sombre/clair) | Mise en page responsive, identité visuelle |
| Vercel (fonctions serverless)                     | Déploiement et proxy API                  |
| APIs externes (CheapShark, SteamSpy, Steam Store) | Données prix, métadonnées et statistiques |

## Lancer le projet

### Cloner et installer

```bash
git clone https://github.com/xaviersanc/Check_moi_ca.git
cd Check_moi_ca
npm install
```

### Configuration `.env` (optionnelle)

Créer un fichier `.env` à la racine pour personnaliser le taux de conversion USD → EUR (0.95 par défaut) :

```
REACT_APP_USD_EUR_RATE=0.95
```

### Démarrage

```bash
npm start
```

Application accessible via [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

## Architecture technique

```
src/
├─ App.jsx                  # Accueil + recherche + liste des jeux
├─ pages/
│  └─ GameDetails.jsx       # Fiche jeu (fusion Steam Store + SteamSpy)
├─ components/
│  ├─ useSteamDealsUnder.js   # offres ≤ 5€ / ≤ 15€
│  ├─ dealUtils.js            # mapping et formatage communs
│  ├─ Header.jsx              # en-tête + bascule de thème
│  ├─ useSteamDealsByTitle.js
│  ├─ steamspy.js           # Statistiques
│  ├─ steamStore.js         # Métadonnées et prix
│  └─ net.js                # Timeouts, retries, fallback
├─ index.js                 # Point d'entrée + routes
├─ index.css
api/
├─ steamspy.js              # Fonction serverless (proxy SteamSpy)
└─ steamstore.js            # Fonction serverless (proxy Steam Store)
```

### Routing

| Route               | Description                     |
| ------------------- | ------------------------------- |
| `/`                 | Accueil, recherche, offres ≤ 5€ / ≤ 15€ |
| `*`                 | Page 404                        |
| `/steam/app/:appid` | Détails d’un jeu                |

### Flow des données (fiche jeu)

1. Appel Steam Store (description, éditeurs, prix)
2. Appel SteamSpy (statistiques, tags, popularité)
3. Fusion des résultats
4. Affichage header CDN, prix, promotions éventuelles, tags et statistiques d’usage

## Endpoints API

### CheapShark (prix)

* Liste ≤ 5€ ou ≤ 15€ (`upperPrice` = budget choisi)
  `https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=15&pageSize=60`
* Recherche jeu par titre
  `https://www.cheapshark.com/api/1.0/deals?storeID=1&title={titre}`
* Documentation : [https://www.postman.com/cheapshark/cheapshark-s-public-workspace/](https://www.postman.com/cheapshark/cheapshark-s-public-workspace/)

### SteamSpy (statistiques)

* App details
  `https://steamspy.com/api.php?request=appdetails&appid={APPID}`
* Documentation : [https://steamspy.com/api.php](https://steamspy.com/api.php)

### Steam Store (métadonnées + prix + description)

* App details
  `https://store.steampowered.com/api/appdetails?appids={APPID}&l=french&cc=fr`
* Documentation : [https://store.steampowered.com/api/](https://store.steampowered.com/api/)

### CDN Steam (images)

* Header
  `https://cdn.cloudflare.steamstatic.com/steam/apps/{APPID}/header.jpg`

### Proxy / fallback (si CORS)

* `https://api.allorigins.win/raw?url={ENCODED_URL}`
  Utilisé automatiquement si les appels directs échouent.


## Notes de déploiement

En production via Vercel, les appels sont routés par des fonctions serverless `/api/steamspy` et `/api/steamstore` pour contourner CORS.
Fallback automatique vers AllOrigins si nécessaire.
Procédure complète : voir [DEPLOIEMENT.md](DEPLOIEMENT.md).

