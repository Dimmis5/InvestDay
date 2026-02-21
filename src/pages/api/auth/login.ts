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
  if (!email || !password) throw "Email and password are required";

  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) throw "Username or password is incorrect";

  const pass = await bcrypt.compare(password, user.password);
  if (!pass) throw "Username or password is incorrect";

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