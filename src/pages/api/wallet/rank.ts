import { apiHandler } from "../../../helpers/api/api-handler";
import { Request } from "../../../types/request.type";
import type { NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default apiHandler(rank);

async function rank(req: Request, res: NextApiResponse<any>) {
  if (req.method !== "GET") {
    throw `Method ${req.method} not allowed`;
  }

  // 1. On récupère plus de portefeuilles (ex: les 200 premiers)
  // pour être sûr d'inclure la majorité des joueurs.
  const allWallets = await prisma.wallet.findMany({
    take: 200, 
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          isAdmin: true,
        },
      },
    },
    orderBy: {
      publicWalletValue: "desc",
    },
  });

  const seenUsers = new Map<string, typeof allWallets[0]>();

  for (const wallet of allWallets) {
    // On ignore les admins
    if (!wallet.user || wallet.user.isAdmin) continue;

    // Déduplication : on ne garde que le meilleur portefeuille par utilisateur
    const userId = String(wallet.userId); // On passe en string pour la Map
    const existing = seenUsers.get(userId);
    
    if (!existing || wallet.publicWalletValue > existing.publicWalletValue) {
      seenUsers.set(userId, wallet);
    }
  }

  // 2. On trie et on renvoie TOUTE la liste dédupliquée (au lieu de slice 0, 10)
  const allRanked = Array.from(seenUsers.values())
    .sort((a, b) => b.publicWalletValue - a.publicWalletValue);

  return res.status(200).json(allRanked);
}