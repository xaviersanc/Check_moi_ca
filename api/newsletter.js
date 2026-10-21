// api/newsletter.js - Inscription à la newsletter Discord de Coin Coin.
// Le visiteur prouve son identité via Discord OAuth2 (scope "identify") : on ne stocke que son ID.
// Le bot lit la liste des abonnés avec un jeton secret (Authorization: Bearer NEWSLETTER_SECRET).
//
// Variables d'environnement (Vercel) :
//   DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET   application Discord du bot
//   NEWSLETTER_SECRET                          secret partagé avec le bot, signe aussi la session
//   KV_REST_API_URL, KV_REST_API_TOKEN         stockage (Upstash Redis, créées par l'intégration Vercel ;
//                                              UPSTASH_REDIS_REST_URL / _TOKEN sont aussi acceptées)
//   SITE_URL (facultatif)                      ex. https://mon-site.vercel.app, sinon l'hôte de la requête
const crypto = require('node:crypto');

const KEY = 'newsletter:subscribers';
const COOKIE = 'nl_session';
const SESSION_SECONDS = 3600;

const REDIS_URL = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const secret = () => process.env.NEWSLETTER_SECRET || '';
const sign = (data) => crypto.createHmac('sha256', `session:${secret()}`).update(data).digest('base64url');
const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

async function redis(...command) {
  const res = await fetch(REDIS_URL(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN()}` },
    body: JSON.stringify(command),
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error || `Redis HTTP ${res.status}`);
  return json.result;
}

const siteUrl = (req) => (process.env.SITE_URL || `https://${req.headers.host}`).replace(/\/$/, '');
const redirectUri = (req) => `${siteUrl(req)}/api/newsletter?action=callback`;

function readCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

const cookie = (name, value, maxAge) =>
  `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;

function getSession(req) {
  const raw = readCookies(req)[COOKIE];
  if (!raw || !secret()) return null;
  const [payload, sig] = raw.split('.');
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return s.exp > Date.now() / 1000 && /^\d{15,25}$/.test(s.id) ? s : null;
  } catch {
    return null;
  }
}

function sessionCookie(user) {
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    name: user.global_name || user.username,
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
  })).toString('base64url');
  return cookie(COOKIE, `${payload}.${sign(payload)}`, SESSION_SECONDS);
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const { action } = req.query;

  if (!secret() || !REDIS_URL() || !process.env.DISCORD_CLIENT_ID) {
    return res.status(503).json({ error: 'Newsletter non configurée' });
  }

  try {
    // 1. Redirection vers Discord
    if (action === 'login') {
      const state = crypto.randomBytes(16).toString('hex');
      const qs = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        response_type: 'code',
        scope: 'identify',
        redirect_uri: redirectUri(req),
        state,
        prompt: 'none',
      });
      res.setHeader('Set-Cookie', cookie('nl_state', state, 600));
      res.setHeader('Location', `https://discord.com/oauth2/authorize?${qs}`);
      return res.status(302).end();
    }

    // 2. Retour de Discord : échange du code, session signée, retour sur la page
    if (action === 'callback') {
      const { code, state } = req.query;
      const expected = readCookies(req).nl_state;
      const back = (status) => {
        res.setHeader('Location', `/newsletter${status ? `?${status}` : ''}`);
        return res.status(302).end();
      };
      if (!code || !state || !expected || !safeEqual(state, expected)) {
        res.setHeader('Set-Cookie', cookie('nl_state', '', 0));
        return back('erreur=1');
      }
      const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri(req),
        }),
      });
      if (!tokenRes.ok) return back('erreur=1');
      const { access_token } = await tokenRes.json();
      const userRes = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${access_token}` } });
      if (!userRes.ok) return back('erreur=1');
      const user = await userRes.json();
      res.setHeader('Set-Cookie', [sessionCookie(user), cookie('nl_state', '', 0)]);
      return back('');
    }

    // 3. État de l'utilisateur connecté
    if (action === 'me') {
      const s = getSession(req);
      if (!s) return res.status(200).json({ loggedIn: false });
      const subscribed = (await redis('SISMEMBER', KEY, s.id)) === 1;
      return res.status(200).json({ loggedIn: true, name: s.name, subscribed });
    }

    // 4. Inscription / désinscription (POST JSON uniquement, protège contre le CSRF)
    if (action === 'subscribe' || action === 'unsubscribe') {
      if (req.method !== 'POST' || !String(req.headers['content-type'] || '').includes('application/json')) {
        return res.status(405).json({ error: 'Méthode non autorisée' });
      }
      const s = getSession(req);
      if (!s) return res.status(401).json({ error: 'Connexion Discord requise' });
      await redis(action === 'subscribe' ? 'SADD' : 'SREM', KEY, s.id);
      return res.status(200).json({ subscribed: action === 'subscribe' });
    }

    // 5. Déconnexion
    if (action === 'logout') {
      res.setHeader('Set-Cookie', cookie(COOKIE, '', 0));
      return res.status(200).json({ ok: true });
    }

    // 6. Réservé au bot : lire la liste, retirer des comptes injoignables
    if (action === 'subscribers' || action === 'remove') {
      const auth = String(req.headers.authorization || '');
      if (!safeEqual(auth, `Bearer ${secret()}`)) return res.status(401).json({ error: 'Non autorisé' });
      if (action === 'subscribers') {
        return res.status(200).json({ ids: await redis('SMEMBERS', KEY) });
      }
      const { ids } = readBody(req);
      const valid = (Array.isArray(ids) ? ids : []).map(String).filter((x) => /^\d{15,25}$/.test(x));
      if (valid.length) await redis('SREM', KEY, ...valid);
      return res.status(200).json({ removed: valid.length });
    }

    return res.status(400).json({ error: 'Action inconnue' });
  } catch (error) {
    console.error('Newsletter error:', error);
    return res.status(502).json({ error: 'Service indisponible' });
  }
};
