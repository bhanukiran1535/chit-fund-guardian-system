const nodemailer = require('nodemailer');

async function welcomeMail(email,firstName) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,   // your gmail
      pass: process.env.MAIL_PASS,   // app password
    },
  });

  await transporter.sendMail({
    from: `"Chit Fund App" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Welcome to MS ChitFunds 💼',
    text: `
    hey ${firstName},
    Welcome to MS ChitFund, your trusted digital partner in smart savings and secure monthly investments!

We’re excited to have you on board. With our easy-to-use web app,and secure monthly payouts, you're in control of your financial journey — every step of the way.

Your account has been successfully created ✅
📈 Track your groups, payments, and payouts in one place 
💬 Need help? Our team is just a click away!

👨🏻‍💻 Login now and explore your dashboard: [Login Link]

Thank you for choosing MS ChitFund — where your money grows safely.

With trust,  
Team MS ChitFund
"Saving Together. Growing Together." 🤝

---

Need help or have questions?  
Reply to this email or contact us at: support@mschitfund.com`,
  });
}

module.exports = { welcomeMail };