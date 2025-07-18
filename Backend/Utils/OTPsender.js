const nodemailer = require('nodemailer');

async function sendOTP(email, otp) {
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
    subject: 'Your Login OTP',
    text: `Your OTP for login is: ${otp}`,
  });
}
