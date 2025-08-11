import { useState } from "react";
import { toast } from "react-hot-toast";
import { addCategoryApi } from "../services/adminService";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";

export default function AddCategory({ categories, setCategories }) {
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const addCategory = async () => {
    if (!newCategory.trim()) return toast.error("Category name required");
    try {
      setLoading(true);
      const newCat = await addCategoryApi(newCategory.trim());
      setCategories([...categories, { ...newCat, items: [], showItems: true }]);
      setNewCategory("");
      toast.success("Category added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding category");
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
      <input
        type="text"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        placeholder="New category name"
        className="border border-gray-300 rounded-md p-3 flex-1 text-gray-700 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        onKeyDown={(e) => {
          if (e.key === "Enter") addCategory();
        }}
        disabled={loading}
      />
      <motion.button
        onClick={addCategory}
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.05 }}
        whileTap={{ scale: loading ? 1 : 0.95 }}
        className={`flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-md
          font-semibold shadow-md transition-colors duration-300
          disabled:bg-blue-300 disabled:cursor-not-allowed`}
      >
        <FaPlus />
        {loading ? "Adding..." : "Add"}
      </motion.button>
    </motion.div>
  );
}
