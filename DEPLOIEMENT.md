# Guide de déploiement sur Vercel

![Vercel](https://img.shields.io/badge/Vercel-d%C3%A9ploiement-000000?logo=vercel&logoColor=white)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)
![Create React App](https://img.shields.io/badge/Create_React_App-5.0.1-09D3AC?logo=createreactapp&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-serverless-5FA04E?logo=nodedotjs&logoColor=white)

Projet réalisé par **Xavier SANCHEZ**.

## 🚀 Déploiement automatique

1. **Connectez votre dépôt GitHub à Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "Import Project"
   - Sélectionnez votre repository

2. **Configuration automatique**
   Vercel détectera automatiquement Create React App et utilisera :
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

3. **Déployez**
   - Cliquez sur "Deploy"
   - Vercel construira et déploiera votre application

## ⚙️ Architecture

### Routes API Serverless

Pour contourner les limitations CORS, l'application utilise des routes API serverless Vercel :

- `/api/steamspy?appid=XXX` - Proxy pour SteamSpy API
- `/api/steamstore?appid=XXX` - Proxy pour Steam Store API

Ces routes sont définies dans le dossier `/api` et sont automatiquement déployées comme fonctions serverless. Elles n'acceptent qu'un `appid` numérique (1 à 10 chiffres) et répondent 400 sinon.

`vercel.json` redirige `/api/steamspy` et `/api/steamstore` vers ces fonctions, et toute autre URL vers `index.html` (nécessaire au routage côté client de React Router : `/steam/app/:appid`).

### Stratégie de récupération des données

Les composants tentent plusieurs sources dans l'ordre :
1. **Route API Vercel** (production uniquement ; absente en `npm start`)
2. **API directe** (peut échouer à cause de CORS)
3. **Proxy AllOrigins** (fallback)

## 🔧 Développement local

En local, les routes `/api` n’existent pas (utiliser `vercel dev` pour les tester) : l’app retombe sur l’API directe puis AlloOrigins, ce qui est plus lent et peut laisser les stats SteamSpy vides.

```bash
npm start
```

## 📦 Build local

Pour tester le build de production localement :

```bash
npm run build
npm install -g serve
serve -s build
```

## 🌐 Variables d'environnement (optionnel)

À définir dans Vercel (Settings → Environment Variables) ou dans un `.env` local. Permet de personnaliser le taux de conversion USD/EUR utilisé pour les filtres de budget (≤ 5 € / ≤ 15 €) :

```env
REACT_APP_USD_EUR_RATE=0.92
```

Par défaut : `0.95`
