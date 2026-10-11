import nodemailer from 'nodemailer';

const configured = () => process.env.SMTP_USER && process.env.SMTP_PASS;
let transport;

export async function sendMail({ to, subject, text }) {
  console.log("Aa Gye")
  if (!configured()) {
    if (process.env.NODE_ENV === 'production') throw new Error('SMTP is not configured');
    console.log(`\n[dev mail] To: ${to}\n${subject}\n${text}\n`); // so you can test without email set up
    return;
  }
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const res= await transport.sendMail({ from: `"JustLove" <${process.env.SMTP_USER}>`, to, subject, text });
  console.log("Mail Sent"+ res.data?.message , res.message , res.data )
}
