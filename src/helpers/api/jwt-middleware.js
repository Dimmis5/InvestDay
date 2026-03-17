import { expressjwt } from "express-jwt";

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
      "/api/auth/login-partenaire",
    ],
  });

  return new Promise((resolve, reject) => {
    middleware(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export { jwtMiddleware };