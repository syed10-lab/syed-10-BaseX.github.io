const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// ROUTES --------

// Root -> index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Auth page
app.get("/auth", (req, res) => {
  res.sendFile(path.join(__dirname, "auth.html"));
});

// Console page
app.get("/console", (req, res) => {
  res.sendFile(path.join(__dirname, "console.html"));
});

// Fake signup/login API
app.post("/api/signup", (req, res) => {
  res.json({ status: "success", msg: "Signup OK", user: req.body });
});

app.post("/api/login", (req, res) => {
  res.json({ status: "success", msg: "Login OK", user: req.body });
});

// START SERVER
app.listen(PORT, () => {
  console.log("BaseX Server running on port:", PORT);
});
