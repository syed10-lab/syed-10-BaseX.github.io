import express from "express";
import { sendOTP } from "../mailer.js";

const router = express.Router();

// TEMP in-memory store (later DB)
const otpStore = {};

// SEND OTP
router.post("/create", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;

    console.log("OTP GENERATED:", email, otp);

    await sendOTP(email, otp);

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("MAIL ERROR:", err);
    res.status(500).json({ message: "OTP failed" });
  }
});

// VERIFY OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!otpStore[email]) {
    return res.status(400).json({ message: "OTP not found" });
  }

  if (String(otpStore[email]) !== String(otp)) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  delete otpStore[email];

  res.json({ success: true, message: "OTP verified" });
});

export default router;
