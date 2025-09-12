import express from "express";
import {
  getPayList,
  createPayList,
  togglePayListDelete,
  deletePayList,
} from "../controllers/payListController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getPayList); // Public
router.post("/", verifyAdmin, createPayList); // Admin only
router.patch("/:id/toggle-delete", verifyAdmin, togglePayListDelete); // Admin only
router.delete("/:id", verifyAdmin, deletePayList); // Admin only

export default router;
