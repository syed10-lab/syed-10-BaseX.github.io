const express = require("express");
const connectDB = require("./mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("BaseX running");
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
  console.log("Server started on", PORT);
});
