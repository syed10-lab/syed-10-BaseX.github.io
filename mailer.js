import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendOTP(email, otp) {
  console.log("📧 Sending OTP to:", email);

  const info = await transporter.sendMail({
    from: `"BaseX" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "BaseX OTP",
    text: `Your OTP is ${otp}`,
  });

  console.log("✅ Mail sent:", info.response);
}
