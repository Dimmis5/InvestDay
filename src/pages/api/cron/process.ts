import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import transactionsService from "../../../services/transactions/transactions.service";
import stockService from "../../../services/stocks/stocks.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secretKey = process.env.CRON_SECRET;
  if (secretKey && req.query.key !== secretKey) {
    return res.status(401).json({ error: "Non autorisé" });
  }

  try {
    const pendingOrders = await prisma.transaction.findMany({
      where: { status: "PENDING" },
      take: 500,
    });

    if (pendingOrders.length === 0) {
      return res.status(200).json({ message: "Aucune transaction en attente." });
    }

    const report = [];
    const now = new Date();

    const nyTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const nyDay = nyTime.getDay();
    const nyTotalMin = nyTime.getHours() * 60 + nyTime.getMinutes();
    const isUSOpen = nyDay >= 1 && nyDay <= 5 && nyTotalMin >= 570 && nyTotalMin < 960; 

    const frTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
    const frDay = frTime.getDay();
    const frTotalMin = frTime.getHours() * 60 + frTime.getMinutes();
    const isFranceOpen = frDay >= 1 && frDay <= 5 && frTotalMin >= 540 && frTotalMin < 1050; 

    const utcDay = now.getUTCDay();
    const utcHour = now.getUTCHours();
    const isForexOpen = !(utcDay === 6 || (utcDay === 5 && utcHour >= 22) || (utcDay === 0 && utcHour < 22));

    for (const order of pendingOrders) {

      const summary: any = await stockService.getLastPrice(order.symbol, 0, "127.0.0.1");
      const stock = summary?.results?.[0];

      if (!stock || !stock.price) {
        report.push({ symbol: order.symbol, status: "ERROR", reason: "Price not found" });
        continue;
      }

      const symbolUpper = order.symbol.toUpperCase();
      
      let shouldExecute = false;

      if (symbolUpper.endsWith(".PA")) {
        shouldExecute = isFranceOpen;
      } 
      else if (symbolUpper.includes('/') || symbolUpper.length === 6 && !symbolUpper.endsWith("USD")) {
        shouldExecute = isForexOpen;
      }
      else if (symbolUpper.endsWith("USD") || symbolUpper.endsWith("USDT")) {
        shouldExecute = true;
      }
      else {
        shouldExecute = isUSOpen;
      }

      if (shouldExecute) {
        const executionPrice = Number(stock.price);
        
        await transactionsService.executeTransaction(order, executionPrice);
        
        report.push({ symbol: order.symbol, status: "SUCCESS", price: executionPrice });
      } else {
        report.push({ symbol: order.symbol, status: "STILL_PENDING", reason: "Market still closed" });
      }
    }

    return res.status(200).json({ processed: pendingOrders.length, details: report });

  } catch (error) {
    console.error("[CRON ERROR]", error);
    return res.status(500).json({ error: "Erreur interne" });
  }
}