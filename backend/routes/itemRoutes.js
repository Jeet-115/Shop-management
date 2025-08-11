import express from "express";
import {
  getItems,
  createItem,
  updateItemQuantity,
  deleteItem,
  updateItemName,
} from "../controllers/itemController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getItems); // Public
router.post("/", verifyAdmin, createItem); // Admin only
router.patch("/:id/quantity", updateItemQuantity);
router.patch("/:id", verifyAdmin, updateItemName);
router.delete("/:id", verifyAdmin, deleteItem); // Admin only

export default router;
