// routes/categoryRoutes.js
import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes here are protected with verifyAdmin middleware
router.get("/", getCategories);
router.post("/", verifyAdmin, createCategory);
router.patch("/:id", verifyAdmin, updateCategory);
router.delete("/:id", verifyAdmin, deleteCategory);

export default router;
