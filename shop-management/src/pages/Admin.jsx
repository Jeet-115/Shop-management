import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUsersCog, FaClipboardList, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import AdminManagement from "../components/AdminManagement";
import OrderHistory from "../components/OrderHistory";
import LogoutButton from "../components/LogoutButton";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("management");
  const navigate = useNavigate();

  const tabs = [
    { id: "management", label: "Management", icon: <FaUsersCog size={18} /> },
    { id: "orders", label: "Order History", icon: <FaClipboardList size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-3 sm:py-10 sm:px-4">
      <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
        
        {/* Title with Back + Logout Buttons */}
        <motion.div
          className="flex items-center justify-between mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h1>

          <div className="flex gap-3">
            <motion.button
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md text-sm sm:text-base font-semibold select-none"
              aria-label="Go back to Home"
              type="button"
            >
              <FaArrowLeft size={18} />
              Back
            </motion.button>

            {/* ✅ Logout button added here */}
            <LogoutButton />
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center justify-center sm:justify-start gap-2 px-4 py-2 sm:px-5 sm:py-2 rounded-xl font-medium transition-all duration-300 shadow-sm text-sm sm:text-base ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Tab Content with Animation */}
        <AnimatePresence mode="wait">
          {activeTab === "management" && (
            <motion.div
              key="management"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="overflow-x-auto"
            >
              <AdminManagement />
            </motion.div>
          )}
          {activeTab === "orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="overflow-x-auto"
            >
              <OrderHistory />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
