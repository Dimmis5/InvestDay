import { apiHandler } from "../../../helpers/api/api-handler";
import type { NextApiRequest, NextApiResponse } from "next";
import { Request } from "../../../types/request.type";
import { prisma } from "../../../lib/prisma";
import requestIp from "request-ip";
import stocksService from "../../../services/stocks/stocks.service";

export default apiHandler(validateTransactions);

async function validateTransactions(req: Request, res: NextApiResponse<any>) {
  if (req.method !== "GET") {
    throw `Method ${req.method} not allowed`;
  }
  
  if (!req.auth.isAdmin) throw "You are not allowed to force transactions";

  // 1. Récupération des transactions en attente
  const transactions = await prisma.transaction.findMany({
    where: {
      status: "PENDING",
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      wallet: {
        select: {
          id: true,
          cash: true,
        },
      },
    },
  });

  const clientIp = requestIp.getClientIp(req);
  if (!clientIp) throw new Error("No client IP found");

  // 2. Traitement séquentiel (for...of au lieu de forEach pour l'async)
  for (const transaction of transactions) {
    try {
      if (!transaction.isSellOrder) {
        // Récupération du wallet à jour
        const wallet = await prisma.wallet.findUnique({
          where: { id: transaction.wallet.id },
        });

        if (!wallet) continue;

        // Récupération du prix actuel via le service
        const priceData: any = await stocksService.getLastPrice(
          transaction.symbol,
          req.auth.sub,
          clientIp as string
        );
        
        const executionPrice = priceData.results[0].price;
        const totalCost = executionPrice * transaction.quantity;
        const newCash = wallet.cash - totalCost;

        // MISE À JOUR DU WALLET AVEC PUBLICWALLETVALUE
        // On définit la valeur publique comme le nouveau cash + la valeur des actions achetées
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            cash: newCash,
            publicWalletValue: newCash + totalCost, // C'est cette ligne qui débloque ton classement
            datePublicUpdated: new Date(),
          },
        });

        // Mise à jour de la transaction en EXECUTED
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "EXECUTED",
            valueAtExecution: executionPrice,
            executedAt: new Date(),
          },
        });

        console.log(`Transaction ${transaction.id} exécutée pour ${transaction.symbol}`);
      }
    } catch (error) {
      console.error(`Erreur sur la transaction ${transaction.id}:`, error);
    }
  }

  return res.status(200).json({ message: "Transactions validées et classement mis à jour", count: transactions.length });
}