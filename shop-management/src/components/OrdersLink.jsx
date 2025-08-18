import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaShoppingCart } from "react-icons/fa";

export default function OrdersLink() {
  return (
    <motion.div
      className="w-full max-w-xs mx-auto sm:mx-0 mb-8 md:mt-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Link
        to="/order"
        className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-md font-semibold transition focus:outline-none focus:ring-4 focus:ring-green-300 select-none w-full sm:w-auto"
        aria-label="Place Order"
      >
        <FaShoppingCart size={20} />
        <span className="text-lg tracking-wide">Place Order</span>
      </Link>
    </motion.div>
  );
}
