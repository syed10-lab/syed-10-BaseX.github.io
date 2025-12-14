import nodemailer from "nodemailer";

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
  console.log("📧 Sending OTP to:", email);

  await transporter.sendMail({
    from: `"BaseX" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "BaseX OTP",
    html: `<h2>Your OTP is ${otp}</h2><p>Valid for 10 minutes</p>`
  });

  console.log("✅ OTP sent");
}
