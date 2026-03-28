import { apiHandler } from "../../../helpers/api/api-handler";
import type { NextApiResponse } from "next";
import stocksService from "../../../services/stocks/stocks.service";
import { Request } from "../../../types/request.type";
import requestIp from 'request-ip';

export default apiHandler(info);

async function info(req: Request, res: NextApiResponse<any>) {
  if (req.method !== "GET") {
    throw `Method ${req.method} not allowed`;
  }

  // On récupère 'range' qui vient du front-end ([nameAction].tsx)
  // On garde 'time' au cas où d'autres parties du site l'utilisent encore
  const { symbol, time, range, market } = req.query; 

  const clientIp = requestIp.getClientIp(req);
  if (typeof symbol !== "string") throw "Invalid request";
  
  /**
   * Gestion de la compatibilité :
   * Si 'range' est présent (nouveau système), on l'utilise.
   * Sinon, on mappe l'ancien 'time' vers le nouveau format de range.
   */
  let selectedRange: any = range;

  if (!selectedRange) {
    const timeMapping: { [key: string]: string } = {
      "day": "1D",
      "week": "1W",
      "month": "1M",
      "1d": "1D",
      "1w": "1W",
      "1m": "1M"
    };
    selectedRange = timeMapping[time as string] || "1D";
  }

  // Appel au service mis à jour
  // Note : j'ai supprimé le paramètre "false" (le boolean _un) car il a été retiré 
  // dans la nouvelle signature du service pour simplifier.
// APRÈS
const marketHint = market === "france" ? "stock_fr" : (market as string) || "stocks";

const resp = await stocksService.getRecentPrices(
  symbol.toUpperCase(),
  selectedRange,
  req.auth.sub,
  clientIp as string,
  marketHint
);
  return res.status(200).json(resp);
}