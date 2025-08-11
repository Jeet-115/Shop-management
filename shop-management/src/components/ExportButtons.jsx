import React from "react";
import { FaFileExcel, FaFilePdf, FaShoppingCart, FaHome } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function ExportButtons({ onExcel, onPDF, onPlaceOrder }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
      {/* Back to Home */}
      <motion.button
        onClick={() => navigate("/")}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 shadow-md select-none"
        aria-label="Back to Home"
        type="button"
      >
        <FaHome />
        Home
      </motion.button>

      {/* Download Excel */}
      <motion.button
        onClick={onExcel}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow-md select-none"
        aria-label="Download Excel"
        type="button"
      >
        <FaFileExcel />
        Excel
      </motion.button>

      {/* Download PDF */}
      <motion.button
        onClick={onPDF}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 shadow-md select-none"
        aria-label="Download PDF"
        type="button"
      >
        <FaFilePdf />
        PDF
      </motion.button>

      {/* Place Order */}
      <motion.button
        onClick={onPlaceOrder}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md select-none"
        aria-label="Place Order"
        type="button"
      >
        <FaShoppingCart />
        Place Order
      </motion.button>
    </div>
  );
}
