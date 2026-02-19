import { expressjwt } from "express-jwt";
const util = require("util");

function jwtMiddleware(req, res) {
  if (!process.env.JWT_SECRET) {
    throw new Error("FATAL: JWT_SECRET environment variable is not set");
  }

  const middleware = expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
  }).unless({
    path: [
      "/api/auth/register",
      "/api/auth/login",
    ],
  });

  return util.promisify(middleware)(req, res);
}

export { jwtMiddleware };