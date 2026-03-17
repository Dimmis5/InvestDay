import { apiHandler } from "../../../helpers/api/api-handler";
import { Request } from "../../../types/request.type";
import type { NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default apiHandler(rank);

async function rank(req: Request, res: NextApiResponse<any>) {
  if (req.method !== "GET") {
    throw `Method ${req.method} not allowed`;
  }

  const allWallets = await prisma.wallet.findMany({
    take: 500, 
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          isAdmin: true,
          isPartenaire: true,
        },
      },
    },
    orderBy: {
      publicWalletValue: "desc",
    },
  });

  const seenUsers = new Map<string, typeof allWallets[0]>();

  for (const wallet of allWallets) {
    if (!wallet.user || wallet.user.isAdmin || wallet.user.isPartenaire) continue; 

    const userId = String(wallet.userId); 
    const existing = seenUsers.get(userId);
    
    if (!existing || wallet.publicWalletValue > existing.publicWalletValue) {
      seenUsers.set(userId, wallet);
    }
  }

  const allRanked = Array.from(seenUsers.values())
    .sort((a, b) => b.publicWalletValue - a.publicWalletValue);

  return res.status(200).json(allRanked);
}