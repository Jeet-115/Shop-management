// routes/adminRoutes.js
import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Compare with env values
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASS
  ) {
    const token = jwt.sign(
      { email: process.env.ADMIN_EMAIL, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    return res.json({ token });
  } else {
    return res.status(401).json({ message: "Invalid email or password" });
  }
});

export default router;
