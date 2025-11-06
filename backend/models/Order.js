import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    message: { type: String },
    items: [
      {
        category: String,
        name: String,
        quantity: Number,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "verified", "sent"],
      default: "pending",
    },
    verifiedBy: { type: String }, // admin email or ID
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
