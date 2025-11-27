const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🔥 BaseX Server Running Successfully!");
});

app.post("/createUser", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  const userId = "user_" + Math.floor(Math.random() * 1000000);

  res.json({
    message: "User created successfully",
    user: {
      id: userId,
      name,
      email
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("BaseX running on port " + PORT));
