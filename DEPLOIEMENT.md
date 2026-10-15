# Guide de déploiement sur Vercel

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

Ces routes sont définies dans le dossier `/api` et sont automatiquement déployées comme fonctions serverless.

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

Si vous souhaitez personnaliser le taux de conversion USD/EUR :

```env
REACT_APP_USD_EUR_RATE=0.92
```

Par défaut : `0.95`
