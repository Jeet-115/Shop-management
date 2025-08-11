import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  fetchCategories,
  fetchItemsByCategory,
  resetQuantities,
  placeOrder as placeOrderAPI,
  updateItemQuantity,
} from "../services/orderService";

import AlertModal from "../components/AlertModal";
import ConfirmModal from "../components/ConfirmModal";

import OrderTable from "../components/OrderTable";
import PlaceOrderModal from "../components/PlaceOrderModal";
import ExportButtons from "../components/ExportButtons";

import {
  FaFileExcel,
  FaFilePdf,
  FaShoppingCart,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Order() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalMessage, setAlertModalMessage] = useState("");
  const [alertModalTitle, setAlertModalTitle] = useState("Alert");

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState({
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
  });

  const fetchCategoriesWithItems = async () => {
    try {
      setLoading(true);
      const categoriesData = await fetchCategories();

      const categoriesWithItems = await Promise.all(
        categoriesData.map(async (category) => {
          const items = await fetchItemsByCategory(category._id);
          const filteredItems = items.filter((item) => item.quantity > 0);
          return { ...category, items: filteredItems };
        })
      );

      setCategories(categoriesWithItems.filter((cat) => cat.items.length > 0));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load order data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesWithItems();
  }, []);

  const afterOrderPlaced = () => {
    setAlertModalMessage("Order placed successfully!");
    setAlertModalTitle("Success");
    setAlertModalOpen(true);

    setEmail("");
    setMessage("");
    setShowModal(false);

    setConfirmModalData({
      title: "Reset Quantities?",
      message: "Do you want to reset the quantity of all current items to 0?",
      onConfirm: async () => {
        setConfirmModalOpen(false);
        try {
          await resetQuantities();
          setAlertModalMessage("All item quantities have been reset to 0.");
          setAlertModalTitle("Success");
          setAlertModalOpen(true);
          await fetchCategoriesWithItems(); // refresh categories with items
        } catch (error) {
          setAlertModalMessage(
            error.response?.data?.message || "Failed to reset quantities"
          );
          setAlertModalTitle("Error");
          setAlertModalOpen(true);
        }
      },
      onCancel: () => setConfirmModalOpen(false),
    });
    setConfirmModalOpen(true);
  };

  const placeOrder = async () => {
    const items = categories.flatMap((cat) =>
      cat.items.map((item) => ({
        category: cat.name,
        name: item.name,
        quantity: item.quantity,
      }))
    );

    try {
      await placeOrderAPI({ email, message, items });
      afterOrderPlaced();
    } catch (err) {
      setAlertModalMessage(
        err.response?.data?.message || "Failed to place order"
      );
      setAlertModalTitle("Error");
      setAlertModalOpen(true);
    }
  };

  const updateQuantity = async (itemId, newQty, categoryId) => {
    try {
      await updateItemQuantity(itemId, newQty);

      setCategories((prev) =>
        prev
          .map((cat) =>
            cat._id === categoryId
              ? {
                  ...cat,
                  items: cat.items
                    .map((item) =>
                      item._id === itemId ? { ...item, quantity: newQty } : item
                    )
                    .filter((item) => item.quantity > 0),
                }
              : cat
          )
          .filter((cat) => cat.items.length > 0)
      );

      toast.success("Quantity updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update quantity");
    }
  };

  const exportToExcel = () => {
    const rows = [];
    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        rows.push({
          Category: cat.name,
          Item: item.name,
          Quantity: item.quantity,
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "orders.xlsx");
  };

  // Enhanced PDF export
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Order Report", 14, 15);

    const tableData = [];
    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        tableData.push([cat.name, item.name, item.quantity]);
      });
    });

    autoTable(doc, {
      head: [["Category", "Item", "Quantity"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [31, 78, 120], textColor: 255, fontSize: 12 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 25 },
    });

    doc.save("orders.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-3 sm:py-10 sm:px-4">
      <AnimatePresence>
        {showModal && (
          <PlaceOrderModal
            email={email}
            setEmail={setEmail}
            message={message}
            setMessage={setMessage}
            onClose={() => setShowModal(false)}
            onSubmit={placeOrder}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModalOpen}
        title={confirmModalData.title}
        message={confirmModalData.message}
        onConfirm={confirmModalData.onConfirm}
        onCancel={confirmModalData.onCancel}
        confirmText="Yes"
        cancelText="No"
      />

      <AlertModal
        isOpen={alertModalOpen}
        title={alertModalTitle}
        message={alertModalMessage}
        onClose={() => setAlertModalOpen(false)}
        closeText="OK"
      />

      <motion.div
        className="max-w-6xl mx-auto bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 md:p-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaShoppingCart className="text-blue-600" />
            Place Order
          </h1>

          <ExportButtons
            onExcel={exportToExcel}
            onPDF={exportToPDF}
            onPlaceOrder={() => setShowModal(true)}
            className="flex gap-3"
          />
        </div>

        {loading ? (
          <motion.div
            className="flex justify-center items-center mt-20"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            aria-label="Loading"
            role="status"
          >
            <FaSpinner className="text-4xl text-blue-600" />
          </motion.div>
        ) : categories.length === 0 ? (
          <motion.p
            className="text-center text-gray-500 mt-16 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No items available
          </motion.p>
        ) : (
          <OrderTable categories={categories} updateQuantity={updateQuantity} />
        )}
      </motion.div>
    </div>
  );
}
