import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWarehouse } from "react-icons/fa";

import EditButton from "../components/EditButton";
import HomeCategoryItems from "../components/HomeCategoryItems";
import AdminLoginModal from "../components/AdminLoginModal";
import OrdersLink from "../components/OrdersLink";
import { fetchCategories, fetchItems } from "../services/homeService";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [itemsByCategory, setItemsByCategory] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catData = await fetchCategories();
        setCategories(catData);

        const itemsData = await fetchItems();
        const grouped = {};
        itemsData.forEach((item) => {
          const catId = item.category?._id || item.category;
          if (!grouped[catId]) grouped[catId] = [];
          grouped[catId].push(item);
        });
        setItemsByCategory(grouped);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-3 sm:py-10 sm:px-4">
        <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
          {/* Page Title */}
          <motion.h1
            className="flex items-center justify-center gap-3 text-3xl sm:text-4xl font-extrabold mb-8 text-gray-800 select-none"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <FaWarehouse className="text-blue-600" size={40} />
            <span>Welcome to Inventory</span>
          </motion.h1>

          {/* Buttons: Edit and Place Order aligned horizontally */}
          <motion.div
            className="flex justify-between items-center mb-10 max-w-md mx-auto sm:max-w-none sm:mx-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Edit Button */}
            <EditButton onLoginRequired={() => setShowModal(true)} />

            {/* Place Order button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <OrdersLink />
            </motion.div>
          </motion.div>

          {/* Categories and Items List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="space-y-12"
          >
            <HomeCategoryItems
              categories={categories}
              itemsByCategory={itemsByCategory}
              setItemsByCategory={setItemsByCategory}
            />
          </motion.div>
        </div>
      </div>
      {/* Admin Login Modal */}
      <AnimatePresence>
        {showModal && <AdminLoginModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
}
