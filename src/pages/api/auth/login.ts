import { apiHandler } from "../../../helpers/api/api-handler";
import jwt from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";

export default apiHandler(login);

async function login(req: NextApiRequest, res: NextApiResponse<any>) {
  if (req.method !== "POST") throw `Method ${req.method} not allowed`;

  if (!process.env.JWT_SECRET) {
    throw new Error("FATAL: JWT_SECRET environment variable is not set");
  }

  const { email, password } = req.body;
  if (!email || !password) throw "L'email et le mot de passe sont requis";


  const user = await prisma.user.findFirst({ where: { email } });
  
  if (!user) throw "Identifiants incorrects";

  const pass = await bcrypt.compare(password, user.password);
  if (!pass) throw "Identifiants incorrects";

  if (user.emailVerified === false) {
    throw "Ton compte n'est pas encore activé. Clique sur le lien envoyé sur ton mail ISEP pour pouvoir te connecter.";
  }

  const token = jwt.sign(
    { sub: user.id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.status(200).json({
    id: user.id,
    username: user.name,
    email: user.email,
    studentId: user.studentId,
    admin: user.isAdmin,
    token,
  });
}