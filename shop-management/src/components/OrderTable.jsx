import React from "react";
import { motion } from "framer-motion";

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
                      <input
                        type="number"
                        className="w-16 text-center border rounded p-1 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={item.quantity}
                        min="0"
                        onClick={(e) => e.target.select()}
                        onChange={(e) =>
                          updateQuantity(
                            item._id,
                            Number(e.target.value),
                            category._id
                          )
                        }
                      />
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
