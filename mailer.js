const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

async function sendOTP(email, otp) {
  await transporter.sendMail({
    from: "BaseX <no-reply@basex>",
    to: email,
    subject: "Your BaseX OTP",
    html: `<h2>Your OTP is ${otp}</h2><p>Valid for 10 minutes</p>`
  });
}

module.exports = { sendOTP };
