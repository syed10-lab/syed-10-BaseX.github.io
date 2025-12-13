const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔴 YAHI MAIN CHEEZ HAI
const uri = process.env.MONGODB_URI;

let client;

async function connectDB() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    console.log("✅ MongoDB connected");
  }
  return client.db("basex");
}

app.get("/", (req, res) => {
  res.send("BaseX server running");
});

app.get("/db-test", async (req, res) => {
  try {
    const db = await connectDB();
    const collections = await db.listCollections().toArray();
    res.json({ success: true, collections });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
