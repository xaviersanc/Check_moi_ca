// api/steamspy.js - Proxy serverless pour SteamSpy
module.exports = async (req, res) => {
  // Permettre CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { appid } = req.query;
  
  if (!appid) {
    return res.status(400).json({ error: 'appid manquant' });
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
    return res.status(200).json(data);
  } catch (error) {
    console.error('SteamSpy API error:', error);
    return res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
};
