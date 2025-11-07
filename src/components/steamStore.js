import { getJsonResilient } from "./net";

export async function fetchSteamStoreDetails(appid) {
  if (!appid) throw new Error("appid manquant");
  
  const vercelApi = `/api/steamstore?appid=${appid}`;
  const abs = `https://store.steampowered.com/api/appdetails?appids=${appid}&l=french`;
  const prox = `https://api.allorigins.win/raw?url=${encodeURIComponent(abs)}`;

  const j = await getJsonResilient([vercelApi, abs, prox], { timeoutMs: 8000 });
  const entry = j?.[appid];
  return entry?.success ? entry.data : null;
}
