import { PrismaClient, Status } from '@prisma/client';

const prisma = new PrismaClient();

async function initializeTransaction() {
  const newTransaction = await prisma.transaction.create({
    data: {
      symbol: "AAPL",
      quantity: 10,
      walletId: 1,
      status: Status.PENDING, // ✅ ça marche maintenant
    },
  });
  return newTransaction;
}

export default prisma;
