import { Transaction, Wallet, Status } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import walletsService from "../wallets/wallets.service";
import stocksService from "../stocks/stocks.service";

async function find(id: string): Promise<Transaction | null> {
  return await prisma.transaction.findUnique({
    where: { id: parseInt(id) },
  });
}

async function findAll(
  walletId: string,
  byExecution: boolean = false
): Promise<Transaction[]> {
  if (!byExecution) {
    return await prisma.transaction.findMany({
      where: { walletId: parseInt(walletId) },
      orderBy: { createdAt: "desc" },
    });
  } else {
    return await prisma.transaction.findMany({
      where: { walletId: parseInt(walletId) },
      orderBy: { executedAt: "asc" },
    });
  }
}

async function create(
  isSellOrder: boolean,
  symbol: string,
  quantity: number,
  walletId: number
): Promise<Transaction> {
  return await prisma.transaction.create({
    data: {
      isSellOrder: isSellOrder,
      symbol: symbol,
      quantity: quantity,
      walletId: walletId,
      status: Status.PENDING,
    },
  });
}

async function updateStatus(
  transactionId: number,
  newStatus: Status,
  fail: boolean = false
) {
  return await prisma.transaction.update({
    where: { id: transactionId },
    data: { status: newStatus },
  });
}

async function executeTransaction(
  transaction: Transaction,
  stockPrice: number
) {
  // 1. Mise à jour de la transaction en base
  const updatedTransaction = await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      valueAtExecution: stockPrice,
      executedAt: new Date(),
      status: Status.EXECUTED,
    },
  });

  // 2. Mise à jour du cash (ajoute ou retire l'argent)
  const walletWithNewCash = await walletsService.addMoney(
    transaction.walletId,
    stockPrice * transaction.quantity * (transaction.isSellOrder ? 1 : -1)
  );

  // --- CALCUL DE LA VALEUR POUR LE CLASSEMENT ---

  // 3. Récupérer toutes les transactions du wallet pour calculer les stocks possédés
  const allTransactions = await prisma.transaction.findMany({
    where: { 
      walletId: transaction.walletId,
      status: Status.EXECUTED 
    },
  });

  // 4. Calculer les quantités nettes par symbole (Achats - Ventes)
  const holdings: { [symbol: string]: number } = {};
  allTransactions.forEach((t) => {
    const qty = t.isSellOrder ? -t.quantity : t.quantity;
    holdings[t.symbol] = (holdings[t.symbol] || 0) + qty;
  });

  // 5. Valoriser les actions avec le prix actuel du marché
  let totalStocksValue = 0;
  for (const symbol in holdings) {
    if (holdings[symbol] > 0) {
      try {
        // On récupère le dernier prix via Polygon
        const priceData = await stocksService.getLastPrice(symbol, 0, "internal");
        const currentPrice = priceData.results?.[0]?.price || stockPrice;
        totalStocksValue += holdings[symbol] * currentPrice;
      } catch (error) {
        console.error(`Erreur lors de la récupération du prix pour ${symbol}:`, error);
        // Fallback sur le prix d'exécution si l'API échoue
        totalStocksValue += holdings[symbol] * stockPrice;
      }
    }
  }

  // 6. Mettre à jour publicWalletValue dans la DB pour le classement
  const newPublicValue = walletWithNewCash.cash + totalStocksValue;
  await walletsService.updatePublicValue(transaction.walletId, newPublicValue);

  return updatedTransaction;
}

const transactionsService = {
  find,
  findAll,
  create,
  updateStatus,
  executeTransaction,
};

export default transactionsService;