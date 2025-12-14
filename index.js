import express from "express";
import cors from "cors";
import { sendOTP } from "./mailer.js";

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("BaseX backend running");
});

// CREATE ACCOUNT → SEND OTP
app.post("/auth/create", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log("🔐 OTP generated:", otp);

    await sendOTP(email, otp); // IMPORTANT: await

    res.json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (err) {
    console.error("❌ MAIL ERROR:", err);

    res.status(500).json({
      success: false,
      message: "OTP sending failed"
    });
  }
});

// START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
