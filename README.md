# Check moi ça

L’application recense les jeux Steam les moins coûteux et centralise les informations nécessaires pour décider rapidement si un titre vaut l’achat. Elle affiche, en plus du prix, des données d’activité comme le temps de jeu médian sur les deux dernières semaines, l’estimation du nombre de joueurs récents et les tags dominants. Ces éléments permettent d’évaluer en un coup d’œil la popularité actuelle, la tendance d’usage et l’intérêt global du jeu, sans avoir à consulter plusieurs sites ou outils externes.


## Stack technique

| Technologie                                       | Rôle                                      |
| ------------------------------------------------- | ----------------------------------------- |
| React (create-react-app)                          | Framework SPA                             |
| JavaScript (ES6+)                                 | Logique applicative                       |
| React Router DOM                                  | Routing                                   |
| Tailwind CSS + Pico.css                           | Mise en page responsive                   |
| Netlify / Vercel                                  | Déploiement                               |
| APIs externes (CheapShark, SteamSpy, Steam Store) | Données prix, métadonnées et statistiques |

## Lancer le projet

### Cloner et installer

```bash
git clone https://github.com/xaviersanc/Check_moi_ca.git
cd Check_moi_ca
npm install
```

### Configuration `.env`

```bash
cp .env.example .env
```

`.env.example` :

```
REACT_APP_USD_EUR_RATE=0.95
DISABLE_ESLINT_PLUGIN=true
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
│  ├─ useSteamDealsUnder15.js
│  ├─ useSteamDealsByTitle.js
│  ├─ steamspy.js           # Statistiques
│  ├─ steamStore.js         # Métadonnées et prix
│  └─ net.js                # Timeouts, retries, fallback
├─ index.js
├─ index.css
```

### Routing

| Route               | Description                     |
| ------------------- | ------------------------------- |
| `/`                 | Accueil, recherche, deals ≤ 15€ |
| `/steam/app/:appid` | Détails d’un jeu                |

### Flow des données (fiche jeu)

1. Appel Steam Store (description, éditeurs, prix)
2. Appel SteamSpy (statistiques, tags, popularité)
3. Fusion des résultats
4. Affichage header CDN, prix, promotions éventuelles, tags et statistiques d’usage

## Endpoints API

### CheapShark (prix)

* Liste ≤ 15€
  `https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=15`
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

## Captures d’écran

### Desktop


![mobile](README\Page_d'accueil_ordi.png)
![mobile](README\Detail_ordi.png)
![mobile](README\Recherche1_ordi.png)
![mobile](README\Recherche2_ordi.png)

### Mobile

![mobile](README\Page_d'accueil_mobile.jpg)
![mobile](README\Detail_mobile.jpg)
![mobile](README\Recherche_mobile.jpg)

## Notes de déploiement

En production via Vercel, les appels sont routés par des fonctions serverless `/api/steamspy` et `/api/steamstore` pour contourner CORS.
Fallback automatique vers AllOrigins si nécessaire.

