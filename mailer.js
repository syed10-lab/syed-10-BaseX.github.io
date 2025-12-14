import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER, // your gmail
    pass: process.env.MAIL_PASS  // gmail APP PASSWORD (16 chars)
  }
});

// Verify transporter ON START (important)
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mail transporter error:", error);
  } else {
    console.log("✅ Mail transporter ready");
  }
});

// Send OTP function
export async function sendOTP(email, otp) {
  console.log("➡️ Sending OTP to:", email);
  console.log("MAIL_USER:", process.env.MAIL_USER ? "SET" : "NOT SET");
  console.log("MAIL_PASS:", process.env.MAIL_PASS ? "SET" : "NOT SET");

  const info = await transporter.sendMail({
    from: `"BaseX" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Your BaseX OTP",
    html: `
      <div style="font-family:Arial">
        <h2>Your OTP: ${otp}</h2>
        <p>This OTP is valid for 10 minutes.</p>
        <p>— BaseX Team</p>
      </div>
    `
  });

  console.log("✅ OTP mail sent, ID:", info.messageId);
}
