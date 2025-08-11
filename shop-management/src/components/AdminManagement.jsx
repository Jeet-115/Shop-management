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

export default function AdminManagement() {
  const [categories, setCategories] = useState([]);

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
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          Category List
        </h2>
        <CategoryList categories={categories} setCategories={setCategories} />
      </motion.div>
    </div>
  );
}
