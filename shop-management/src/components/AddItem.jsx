import { useState } from "react";
import { toast } from "react-hot-toast";
import { addItemApi } from "../services/adminService";
import { motion } from "framer-motion";
import { FaPlusCircle } from "react-icons/fa";

export default function AddItem({ categories, setCategories }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(0);
  const [loading, setLoading] = useState(false);

  const addItem = async () => {
    if (!selectedCategoryId || !newItemName.trim()) {
      return toast.error("Select category & enter item name");
    }
    if (newItemQty < 0) {
      return toast.error("Quantity cannot be negative");
    }
    try {
      setLoading(true);
      const newItem = await addItemApi(
        selectedCategoryId,
        newItemName.trim(),
        newItemQty
      );
      setCategories(
        categories.map((c) =>
          c._id === selectedCategoryId
            ? { ...c, items: [...c.items, newItem] }
            : c
        )
      );
      setNewItemName("");
      setNewItemQty(0);
      toast.success("Item added");
    } catch {
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col sm:flex-row gap-3 mb-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <select
        value={selectedCategoryId}
        onChange={(e) => setSelectedCategoryId(e.target.value)}
        className="border border-gray-300 rounded-md p-3 text-gray-700
          focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        disabled={loading}
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={newItemName}
        onChange={(e) => setNewItemName(e.target.value)}
        placeholder="Item name"
        className="border border-gray-300 rounded-md p-3 flex-1 text-gray-700 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        onKeyDown={(e) => {
          if (e.key === "Enter") addItem();
        }}
        disabled={loading}
      />

      <input
        type="number"
        min={0}
        value={newItemQty}
        onChange={(e) => {
          const val = Number(e.target.value);
          setNewItemQty(val >= 0 ? val : 0);
        }}
        className="border border-gray-300 rounded-md p-3 w-24 text-center text-gray-700
          focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        disabled={loading}
      />

      <motion.button
        onClick={addItem}
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.05 }}
        whileTap={{ scale: loading ? 1 : 0.95 }}
        className={`flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-md
          font-semibold shadow-md transition-colors duration-300
          disabled:bg-green-300 disabled:cursor-not-allowed`}
      >
        <FaPlusCircle />
        {loading ? "Adding..." : "Add"}
      </motion.button>
    </motion.div>
  );
}
