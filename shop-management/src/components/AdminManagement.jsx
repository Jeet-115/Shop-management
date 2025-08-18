import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  fetchCategoriesApi,
  fetchItemsByCategoryApi,
} from "../services/adminService";
import FileUpload from "./FileUpload";
import AddCategory from "./AddCategory";
import AddItem from "./AddItem";
import CategoryList from "./CategoryList";
import { resetAllItemQuantities } from "../services/homeService";

export default function AdminManagement() {
  const [categories, setCategories] = useState([]);
  const [loadingReset, setLoadingReset] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoryList = await fetchCategoriesApi();
      const categoriesWithItems = await Promise.all(
        categoryList.map(async (cat) => {
          const items = await fetchItemsByCategoryApi(cat._id);
          return { ...cat, items, showItems: true };
        })
      );
      setCategories(categoriesWithItems);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  const handleResetQuantities = async () => {
    try {
      setLoadingReset(true);
      const response = await resetAllItemQuantities();
      toast.success(response.message);
      // Refetch categories and items to update UI
      fetchCategories();
    } catch (err) {
      console.error("Error resetting quantities:", err);
      toast.error("Failed to reset quantities");
    } finally {
      setLoadingReset(false);
    }
  };

  const sectionClasses =
    "bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4 sm:p-6 md:p-8";

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* File Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={sectionClasses}
      >
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          Upload Data
        </h2>
        <FileUpload onUploadSuccess={fetchCategories} />
      </motion.div>

      {/* Add Category Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={sectionClasses}
      >
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          Add New Category
        </h2>
        <AddCategory categories={categories} setCategories={setCategories} />
      </motion.div>

      {/* Add Item Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={sectionClasses}
      >
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          Add New Item
        </h2>
        <AddItem categories={categories} setCategories={setCategories} />
      </motion.div>

      {/* Category List Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className={`${sectionClasses} overflow-x-auto`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Category List
          </h2>
          <motion.button
            onClick={handleResetQuantities}
            disabled={loadingReset}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loadingReset ? "Resetting..." : "Reset Quantities"}
          </motion.button>
        </div>

        <CategoryList categories={categories} setCategories={setCategories} />
      </motion.div>
    </div>
  );
}
