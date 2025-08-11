// routes/excelRoutes.js
import express from "express";
import { importFromExcel } from "../controllers/excelImportController.js";
import upload from "../middleware/uploadMiddleware.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/upload", verifyAdmin, upload.single("file"), importFromExcel);

export default router;
