const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTP } = require("./mailer");

const users = {};      // TEMP (DB baad me)
const otps = {};       // TEMP (DB baad me)

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = (app) => {

  // 🔹 SEND OTP
  app.post("/auth/send-otp", async (req, res) => {
    const { email } = req.body;
    const otp = generateOTP();

    otps[email] = otp;
    await sendOTP(email, otp);

    res.json({ success: true, message: "OTP sent" });
  });

  // 🔹 REGISTER
  app.post("/auth/register", async (req, res) => {
    const { name, email, password, otp, referral } = req.body;

    if (otps[email] !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const hash = await bcrypt.hash(password, 10);
    users[email] = { name, email, password: hash, referral };

    delete otps[email];

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, token });
  });

};
