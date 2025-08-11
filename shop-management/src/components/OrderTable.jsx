import React from "react";
import { motion } from "framer-motion";
import { FaMinus, FaPlus } from "react-icons/fa";

export default function OrderTable({ categories, updateQuantity }) {
  return (
    <>
      {categories.map((category) => (
        <motion.div
          key={category._id}
          className="mb-6 border rounded-lg p-4 shadow-md bg-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-3 text-gray-800">{category.name}</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[300px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left text-sm sm:text-base">Item</th>
                  <th className="border p-3 text-center text-sm sm:text-base">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {category.items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="border p-3 text-sm sm:text-base">{item.name}</td>
                    <td className="border p-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <motion.button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1, category._id)
                          }
                          disabled={item.quantity <= 0}
                          whileHover={{ scale: item.quantity > 0 ? 1.1 : 1 }}
                          whileTap={{ scale: item.quantity > 0 ? 0.95 : 1 }}
                          className={`flex items-center justify-center w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition`}
                          aria-label={`Decrease quantity of ${item.name}`}
                          type="button"
                        >
                          <FaMinus />
                        </motion.button>

                        <span className="min-w-[30px] text-center text-sm sm:text-base font-medium">
                          {item.quantity}
                        </span>

                        <motion.button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1, category._id)
                          }
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 transition"
                          aria-label={`Increase quantity of ${item.name}`}
                          type="button"
                        >
                          <FaPlus />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ))}
    </>
  );
}
