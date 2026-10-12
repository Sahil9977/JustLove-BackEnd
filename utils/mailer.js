// import nodemailer from 'nodemailer';

// const configured = () => process.env.SMTP_USER && process.env.SMTP_PASS;
// let transport;

// export async function sendMail({ to, subject, text }) {
//   console.log("Aa Gye")
//   if (!configured()) {
//     if (process.env.NODE_ENV === 'production') throw new Error('SMTP is not configured');
//     console.log(`\n[dev mail] To: ${to}\n${subject}\n${text}\n`); // so you can test without email set up
//     return;
//   }
//   transport ??= nodemailer.createTransport({
//     host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
//     auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
//   });
//   const res= await transport.sendMail({ from: `"JustLove" <${process.env.SMTP_USER}>`, to, subject, text });
//   console.log("Mail Sent"+ res.data?.message , res.message , res.data )
// }


// #######################################3 BREVO VERSION

const configured = () => process.env.BREVO_API_KEY && process.env.MAIL_FROM;

export async function sendMail({ to, subject, text }) {
  if (!configured()) {
    if (process.env.NODE_ENV === 'production') throw new Error('Mail is not configured');
    console.log(`\n[dev mail] To: ${to}\n${subject}\n${text}\n`);
    return;
  }
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'JustLove', email: process.env.MAIL_FROM },
      to: [{ email: to }],
      subject,
      textContent: text,
    }),
    signal: AbortSignal.timeout(10000), // never wait more than 10 seconds
  });
  if (!r.ok) throw new Error(`Mail API ${r.status}: ${(await r.text()).slice(0, 200)}`);
  console.log('Mail Sent');
}