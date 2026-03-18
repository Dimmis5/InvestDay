import { Transaction, Status } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import walletsService from "../wallets/wallets.service";

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
  const updatedTransaction = await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      valueAtExecution: stockPrice,
      executedAt: new Date(),
      status: Status.EXECUTED,
    },
  });

  const walletWithNewCash = await walletsService.addMoney(
    transaction.walletId,
    stockPrice * transaction.quantity * (transaction.isSellOrder ? 1 : -1)
  );

  const allTransactions = await prisma.transaction.findMany({
    where: { 
      walletId: transaction.walletId,
      status: Status.EXECUTED 
    }
  });

  const inventory: { [symbol: string]: number } = {};
  allTransactions.forEach(t => {
    const qty = t.quantity * (t.isSellOrder ? -1 : 1);
    inventory[t.symbol] = (inventory[t.symbol] || 0) + qty;
  });

  let assetsValue = 0;
  for (const symbol in inventory) {
    const qte = inventory[symbol];
    if (qte > 0) {
      if (symbol === transaction.symbol) {
        assetsValue += qte * stockPrice;
      } else {
        const lastTx = allTransactions
          .filter(tx => tx.symbol === symbol)
          .sort((a, b) => b.executedAt!.getTime() - a.executedAt!.getTime())[0];
        assetsValue += qte * (lastTx.valueAtExecution || 0);
      }
    }
  }

  const totalIndicativeValue = walletWithNewCash.cash + assetsValue;

  await walletsService.updatePublicValue(
    transaction.walletId,
    totalIndicativeValue
  );

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