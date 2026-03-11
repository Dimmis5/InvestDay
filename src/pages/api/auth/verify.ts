import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function verify(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).send("Token de vérification manquant.");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      return res.redirect("/login?error=Lien_invalide_ou_expire");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null, 
      },
    });

    return res.redirect("/login?verified=true");

  } catch (error) {
    console.error("[VERIFY_ERROR]", error);
    return res.redirect("/login?error=Erreur_serveur");
  }
}