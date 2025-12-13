const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.error("MongoDB Error ❌", err.message);
  }
}
connectDB();

// ✅ TEST ROUTE (IMPORTANT)
app.get("/db-test", async (req, res) => {
  try {
    const db = client.db("basex");
    await db.command({ ping: 1 });
    res.json({ success: true, message: "DB Connected & API Working" });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Root check (optional but good)
app.get("/", (req, res) => {
  res.send("BaseX API running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
