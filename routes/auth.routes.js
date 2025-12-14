import express from "express";

const router = express.Router();

// SIGNUP
router.post("/create", async (req, res) => {
  console.log("AUTH CREATE HIT", req.body);

  res.json({
    success: true,
    message: "Signup route working"
  });
});

// LOGIN
router.post("/login", async (req, res) => {
  res.json({
    success: true,
    message: "Login route working"
  });
});

export default router;
