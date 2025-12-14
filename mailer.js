import nodemailer from "nodemailer";

console.log("MAIL_USER:", process.env.MAIL_USER ? "OK" : "MISSING");
console.log("MAIL_PASS:", process.env.MAIL_PASS ? "OK" : "MISSING");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export async function sendOTP(email, otp) {
  const info = await transporter.sendMail({
    from: `"BaseX" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "BaseX OTP Verification",
    html: `
      <h2>Your OTP: ${otp}</h2>
      <p>Valid for 10 minutes</p>
    `
  });

  console.log("✅ OTP sent:", info.response);
}
