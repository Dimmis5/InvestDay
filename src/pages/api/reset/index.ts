import { apiHandler } from "../../../helpers/api/api-handler";
import type { NextApiRequest, NextApiResponse } from "next";
import stocksService from "../../../services/stocks/stocks.service";
import { Request } from "../../../types/request.type";
import requestIp from 'request-ip';
import nodemailer from "nodemailer";

//import stocksService from "../../../services/stocks/stocks.service";

// you can use the api now

export default apiHandler(sendReset);

async function sendReset(req: Request, res: NextApiResponse<any>) {
  if (req.method !== "POST") {
    throw `Method ${req.method} not allowed`;
  }
  const { email } = req.query;

  const transporter = nodemailer.createTransport({
    port: parseInt(process.env.SMTP_PORT!),
    host: process.env.SMTP_HOST!,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
    secure: true,
  });

  const mailData = {
    from: process.env.SMTP_USER!,
    to: email,
    subject: `Réinitialisation de votre mot de passe`,
    text: 'Réinitialisation de votre mot de passe',
    html: '<div><h1>Réinitialisation de votre mot de passe :</h1></div>'
   }
  
   transporter.sendMail(mailData, function (err, info) {
    if(err)
      console.log(err)
    else
      console.log(info)
  })

  return res.status(200);
}
