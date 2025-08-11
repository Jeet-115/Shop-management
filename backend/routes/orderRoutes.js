import express from "express";
import { getAvailableItemsForOrder, placeOrder, resetAllItemQuantities, getAllOrders } from "../controllers/orderController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/items", getAvailableItemsForOrder);
router.post("/place", placeOrder);
router.post("/reset-quantities", resetAllItemQuantities);
router.get("/history", verifyAdmin, getAllOrders);

export default router;
