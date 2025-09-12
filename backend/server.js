import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import cron from "node-cron";
import Item from "./models/Item.js"; // path corrected to your file

import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import excelRoutes from "./routes/excelRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import payListRoutes from "./routes/payListRoutes.js";

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://santcorporation.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ CORS blocked for origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/excel", excelRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/paylist", payListRoutes);

// Logger for dev
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Health check
app.get("/health", (req, res) => {
  console.log("🩺 Health check at:", new Date().toLocaleString());
  res.status(200).send("OK");
});

// Root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handler (basic)
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ message: err.message });
});

// ====== CRON JOB TO RESET ITEM QUANTITIES EVERY HOUR ======
cron.schedule("*/5 * * * *", async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    console.log("⏳ Checking items to reset at", new Date().toLocaleString());

    // Only reset items whose updatedAt is more than 30 minutes old
    const result = await Item.updateMany(
      { updatedAt: { $lt: thirtyMinutesAgo }, quantity: { $gt: 0 } },
      { $set: { quantity: 0 } }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Reset ${result.modifiedCount} item(s) to quantity 0`);
    }
  } catch (error) {
    console.error("❌ Error resetting quantities:", error);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
