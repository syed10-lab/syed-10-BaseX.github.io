const express = require("express");
const { connectDB } = require("./mongodb");

const app = express();
app.use(express.json());

app.get("/db-test", async (req, res) => {
  try {
    const db = await connectDB();
    res.json({
      success: true,
      message: "MongoDB Connected & Stable"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("BaseX API running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
