import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// SMTP HOST --> we are using Gmail SMTP server/ Brevo SMTP server
/* Your SMTP Settings
SMTP Server
smtp-relay.brevo.com
Port
587
Login
8437f4001@smtp-brevo.com

*/
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com" ,
  port: 587,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
    }
  
  });


export default transporter;
