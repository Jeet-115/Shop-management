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
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
