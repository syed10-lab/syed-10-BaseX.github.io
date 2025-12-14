import express from "express";
import { sendOTP } from "../mailer.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);

    console.log("OTP:", otp);

    await sendOTP(email, otp);

    res.json({ success: true, message: "OTP SENT" });
  } catch (e) {
    console.error("MAIL FAIL:", e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
