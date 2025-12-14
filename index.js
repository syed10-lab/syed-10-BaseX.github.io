import express from "express";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json());

// 🔥 THIS LINE IS CRITICAL
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
