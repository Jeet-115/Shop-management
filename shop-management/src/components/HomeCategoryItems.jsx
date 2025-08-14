import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { updateItemQuantity } from "../services/homeService";

export default function HomeCategoryItems({
  categories,
  itemsByCategory,
  setItemsByCategory,
}) {
  const [showItems, setShowItems] = useState({});

  const updateQuantity = async (itemId, newQty) => {
    if (isNaN(newQty) || newQty < 0) return;
    try {
      const updatedItem = await updateItemQuantity(itemId, newQty);
      setItemsByCategory((prev) => {
        const updated = { ...prev };
        for (const catId in updated) {
          updated[catId] = updated[catId].map((item) =>
            item._id === itemId
              ? { ...item, quantity: updatedItem.quantity }
              : item
          );
        }
        return updated;
      });
      toast.success("Item quantity updated");
    } catch (err) {
      toast.error("Failed to update quantity");
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-2 sm:px-0">
      {categories.map((cat) => (
        <div
          key={cat._id}
          className="border rounded-lg p-4 bg-white shadow-sm"
        >
          <div
            className="flex justify-between items-center cursor-pointer select-none"
            onClick={() =>
              setShowItems((prev) => ({
                ...prev,
                [cat._id]: !prev[cat._id],
              }))
            }
          >
            <h2 className="text-lg font-semibold text-gray-800">{cat.name}</h2>
            <button
              aria-expanded={!!showItems[cat._id]}
              aria-controls={`items-list-${cat._id}`}
              className="flex items-center gap-1 text-blue-600 font-medium focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setShowItems((prev) => ({
                  ...prev,
                  [cat._id]: !prev[cat._id],
                }));
              }}
              type="button"
            >
              {showItems[cat._id] ? (
                <>
                  <FaChevronUp aria-hidden="true" />
                  <span className="sr-only">Hide items</span>
                </>
              ) : (
                <>
                  <FaChevronDown aria-hidden="true" />
                  <span className="sr-only">Show items</span>
                </>
              )}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {showItems[cat._id] && (
              <motion.ul
                key="items"
                id={`items-list-${cat._id}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="mt-4 space-y-3 overflow-hidden"
              >
                {itemsByCategory[cat._id]?.map((item) => (
                  <li
                    key={item._id}
                    className="flex justify-between items-center border rounded-md p-3 shadow-sm bg-gray-50"
                  >
                    <span className="font-medium text-gray-700 truncate max-w-xs sm:max-w-md">
                      {item.name}
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onFocus={(e) => e.target.select()} // select all text on click
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setItemsByCategory((prev) => {
                          const updated = { ...prev };
                          for (const catId in updated) {
                            updated[catId] = updated[catId].map((i) =>
                              i._id === item._id
                                ? { ...i, quantity: val }
                                : i
                            );
                          }
                          return updated;
                        });
                      }}
                      onBlur={(e) =>
                        updateQuantity(item._id, parseInt(e.target.value, 10) || 0)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.target.blur(); // triggers onBlur update
                        }
                      }}
                      className="w-16 text-center border rounded-md px-2 py-1 font-mono text-gray-800 focus:outline-none focus:ring focus:border-blue-300"
                    />
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
