import express from "express";
const router = express.Router();

// Get current session cart
router.get("/", (req, res) => {
  res.json(req.session.quantities || {});
});

// Update item quantity in session cart
router.post("/update", (req, res) => {
  const { itemId, quantity } = req.body;

  if (!req.session.quantities) {
    req.session.quantities = {};
  }

  req.session.quantities[itemId] = quantity;
  req.session.save();

  res.json({ success: true, quantities: req.session.quantities });
});

// Clear session cart (optional endpoint)
router.post("/clear", (req, res) => {
  req.session.quantities = {};
  req.session.save();
  res.json({ success: true });
});

export default router;
