import express from "express";
import { sendOTP } from "../mailer.js";

const router = express.Router();

// TEMP OTP STORE (memory)
const otpStore = new Map();

/* SEND OTP */
router.post("/create", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore.set(email, otp);

    console.log("OTP:", otp);

    await sendOTP(email, otp);

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("MAIL ERROR:", err);
    res.status(500).json({ message: "OTP failed" });
  }
});

/* VERIFY OTP */
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  const savedOTP = otpStore.get(email);
  if (!savedOTP) {
    return res.status(400).json({ message: "OTP expired" });
  }

  if (Number(otp) !== savedOTP) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  otpStore.delete(email);
  res.json({ success: true, message: "OTP verified" });
});

export default router;
