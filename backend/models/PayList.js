import mongoose from "mongoose";

const payListSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    checkNo: {
      type: String,
      required: true,
      trim: true,
    },
    paidTo: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false, // soft delete flag
    },
  },
  { timestamps: true }
);

const PayList = mongoose.model("PayList", payListSchema);
export default PayList;
