import express from "express";
import { sendOTP } from "../mailer.js";

const router = express.Router();

/* ===============================
   TEMP OTP STORE (NO DB YET)
================================ */
const otpStore = new Map(); // email -> { otp, expires }

/* ===============================
   SEND OTP
   POST /auth/create
================================ */
router.post("/create", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 min
    });

    console.log("OTP GENERATED:", email, otp);

    await sendOTP(email, otp);

    res.json({ success: true, message: "OTP SENT" });

  } catch (err) {
    console.error("OTP SEND ERROR:", err);
    res.status(500).json({ message: "OTP FAILED" });
  }
});

/* ===============================
   VERIFY OTP
   POST /auth/verify-otp
================================ */
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Missing email or OTP" });
  }

  const record = otpStore.get(email);

  if (!record) {
    return res.status(400).json({ message: "OTP expired or not found" });
  }

  if (Date.now() > record.expires) {
    otpStore.delete(email);
    return res.status(400).json({ message: "OTP expired" });
  }

  if (String(record.otp) !== String(otp)) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  otpStore.delete(email);

  res.json({
    success: true,
    message: "OTP VERIFIED"
  });
});

export default router;
