// api/steamspy.js - Proxy serverless pour SteamSpy
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { appid } = req.query;

  // Uniquement des chiffres : évite l'injection de paramètres dans l'URL amont
  if (typeof appid !== 'string' || !/^\d{1,10}$/.test(appid)) {
    return res.status(400).json({ error: 'appid invalide' });
  }

  try {
    const url = `https://steamspy.com/api.php?request=appdetails&appid=${appid}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    // Cache CDN : limite la charge sur l'API amont et accélère les fiches déjà vues
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(data);
  } catch (error) {
    console.error('SteamSpy API error:', error);
    return res.status(502).json({ error: 'SteamSpy indisponible' });
  }
};
