import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export async function sendOTP(email, otp) {
  await transporter.sendMail({
    from: `"BaseX" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Your BaseX OTP",
    html: `<h2>Your OTP is ${otp}</h2>`
  });
}
