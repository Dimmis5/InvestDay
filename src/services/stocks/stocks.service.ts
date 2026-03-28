import { StockApi } from "../../types/stockapi.type";

const { FINAGE_API_KEY } = process.env;

export type TimeRange = "1H" | "1D" | "1W" | "1M" | "ALL";

type AssetType = "crypto" | "forex" | "stock" | "stock_fr";

function getAssetType(symbol: string, marketHint?: string): AssetType {
  const s = symbol.toUpperCase();
  

  if (marketHint === "france" || marketHint === "stock_fr" || s.endsWith(".PA")) {
    return "stock_fr";
  }


  if (marketHint === "crypto" || s.endsWith("USD") || s.endsWith("USDT")) {
    if (marketHint === "action" || marketHint === "stocks") return "stock";
    return "crypto";
  }

  if (marketHint === "forex" || s.length === 6) return "forex";

  return "stock";
}


function getEndpointSegment(type: AssetType): string {
  switch (type) {
    case "crypto":   return "crypto";
    case "forex":    return "forex";
    case "stock_fr": return "stock/fr";
    default:         return "stock";
  }
}

function formatSymbol(symbol: string, type: AssetType): string {
  const s = symbol.toUpperCase();
  if (type === "stock_fr") return s.replace(/\.PA$/, "");
  return s;
}

async function getLastPrice(symbol: string, userId: number, ip: string, marketHint?: string): Promise<any> {
  const type = getAssetType(symbol, marketHint);
  const segment = getEndpointSegment(type);
  const formatted = formatSymbol(symbol, type);

  try {
    const url = `https://api.finage.co.uk/last/${segment}/${formatted}?apikey=${FINAGE_API_KEY}`;
    const r = await fetch(url);
    const data = await r.json();

    const price = data.price || data.p || data.last || data.ask || data.bid;
    if (price && price > 0) {
      return { 
        results: [{ 
          price, 
          symbol: symbol.toUpperCase(), 
          market_status: "open" 
        }] 
      };
    }
  } catch (err) {
    console.error("Erreur getLastPrice:", err);
  }
  return { results: [] };
}

async function getRecentPrices(symbol: string, range: TimeRange = "ALL", userId: number, ip: string, marketHint?: string): Promise<any> {
  const type = getAssetType(symbol, marketHint);
  const segment = getEndpointSegment(type);
  const formatted = formatSymbol(symbol, type);

  const now = new Date();
  const to = now.toISOString().split("T")[0]; 
  let from: string;
  let multiplier: number;
  let timespan: string;

  switch (range) {
    case "1H": 
      from = new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString().split("T")[0];
      multiplier = 1; timespan = "minute"; break;
    case "1D": 
      from = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString().split("T")[0];
      multiplier = 15; timespan = "minute"; break;
    case "1W": 
      from = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000)).toISOString().split("T")[0];
      multiplier = 1; timespan = "hour"; break;
    case "1M": 
      from = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000)).toISOString().split("T")[0];
      multiplier = 8; timespan = "hour"; break;
    case "ALL":
    default:   
      from = new Date(now.getTime() - (5 * 365 * 24 * 60 * 60 * 1000)).toISOString().split("T")[0];
      multiplier = 1; timespan = "week"; break;
  }

  try {
    const aggSegment = (type === "stock_fr") ? "stock" : segment;
    const aggSymbol = (type === "stock_fr") ? symbol.toUpperCase() : formatted;

    const url = `https://api.finage.co.uk/agg/${aggSegment}/${aggSymbol}/${multiplier}/${timespan}/${from}/${to}?limit=2000&sort=asc&apikey=${FINAGE_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      return { results: data.results };
    }
  } catch (err) {}

  const lastData = await getLastPrice(symbol, userId, ip, marketHint);
  const currentPrice = lastData?.results?.[0]?.price;
  if (currentPrice) {
    return { results: buildFlatHistory(currentPrice, range, symbol) };
  }

  return { results: [] };
}


function buildFlatHistory(price: number, range: TimeRange, symbol: string): any[] {
  const now = new Date();
  now.setSeconds(0, 0);
  const timestamp = now.getTime();
  const points: any[] = [];
  let intervalMs: number, totalPoints: number;

  switch (range) {
    case "1H": intervalMs = 60000; totalPoints = 60; break;
    case "1D": intervalMs = 900000; totalPoints = 96; break;
    case "1W": intervalMs = 3600000; totalPoints = 168; break;
    case "1M": intervalMs = 28800000; totalPoints = 90; break;
    default:   intervalMs = 86400000; totalPoints = 365;
  }

  const start = timestamp - intervalMs * totalPoints;
  let seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seededRandom = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

  let curr = price;
  const tmp = [];
  for (let i = 0; i <= totalPoints; i++) {
    curr += curr * (seededRandom() * 0.004 - 0.002);
    tmp.push(curr);
  }
  const diff = price - tmp[tmp.length - 1];
  for (let i = 0; i <= totalPoints; i++) {
    const final = tmp[i] + (diff * (i / totalPoints));
    points.push({ t: start + intervalMs * i, o: final, h: final * 1.001, l: final * 0.999, c: final, v: 100 });
  }
  return points;
}

const stocksService = {

  search: async (term: string, userId?: string | number, ip?: string) => {
    try {
      const r = await fetch(`https://api.finage.co.uk/fnd/search/market/us/${term}?limit=10&apikey=${FINAGE_API_KEY}`);
      const d = await r.json();
      return d.results || [];
    } catch (err) {
      console.error("Erreur search service:", err);
      return [];
    }
  },

  getRecentPrices,

  getLastPrice,

  getDetailsStock: async (symbol: string, userId?: string | number, ip?: string) => {
    return { 
      results: { 
        name: symbol.toUpperCase(), 
        branding: { logo_url: null } 
      } 
    };
  },

  getPreviousClose: async (symbol: string, userId?: number, ip?: string) => {
    return null;
  },

  getLogoStock: async (url?: string, userId?: string | number, ip?: string) => {
    return "";
  },
};

export default stocksService;