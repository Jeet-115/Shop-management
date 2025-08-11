import { useState } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  deleteCategoryApi,
  updateCategoryNameApi,
  updateItemNameApi,
  updateItemQuantityApi,
  deleteItemApi,
} from "../services/adminService";
import {
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaSave,
  FaPlus,
  FaMinus,
} from "react-icons/fa";

import ConfirmModal from "./ConfirmModal";
export default function CategoryList({ categories, setCategories }) {
  // Manage editing state per category and per item
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [categoryNameDraft, setCategoryNameDraft] = useState("");
  const [itemNameDraft, setItemNameDraft] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // New state for confirm modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState({
    type: null, // "category" or "item"
    id: null,
    categoryId: null, // only for item
    title: "",
    message: "",
    onConfirm: null,
  });

  // Open confirm modal for category delete
  const confirmDeleteCategory = (id) => {
    setConfirmModalData({
      type: "category",
      id,
      title: "Delete Category",
      message:
        "Are you sure you want to delete this category and all its items? This action cannot be undone.",
      onConfirm: () => handleDeleteCategory(id),
    });
    setConfirmModalOpen(true);
  };

  // Open confirm modal for item delete
  const confirmDeleteItem = (id, categoryId) => {
    setConfirmModalData({
      type: "item",
      id,
      categoryId,
      title: "Delete Item",
      message:
        "Are you sure you want to delete this item? This action cannot be undone.",
      onConfirm: () => handleDeleteItem(id, categoryId),
    });
    setConfirmModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    setConfirmModalOpen(false);
    try {
      await deleteCategoryApi(id);
      setCategories(categories.filter((c) => c._id !== id));
      toast.success("Category deleted");
    } catch {
      toast.error("Error deleting category");
    }
  };

  const saveCategoryName = async (id) => {
    if (!categoryNameDraft.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    try {
      const updated = await updateCategoryNameApi(id, categoryNameDraft.trim());
      setCategories(
        categories.map((c) => (c._id === id ? { ...c, name: updated.name } : c))
      );
      toast.success("Category updated");
      setEditingCategoryId(null);
      setCategoryNameDraft("");
    } catch {
      toast.error("Failed to update category");
    }
  };

  const startEditingCategory = (id, currentName) => {
    setEditingCategoryId(id);
    setCategoryNameDraft(currentName);
  };

  const cancelEditingCategory = () => {
    setEditingCategoryId(null);
    setCategoryNameDraft("");
  };

  const saveItemName = async (id, categoryId) => {
    if (!itemNameDraft.trim()) {
      toast.error("Item name cannot be empty");
      return;
    }
    try {
      await updateItemNameApi(id, itemNameDraft.trim());
      setCategories(
        categories.map((c) =>
          c._id === categoryId
            ? {
                ...c,
                items: c.items.map((i) =>
                  i._id === id ? { ...i, name: itemNameDraft.trim() } : i
                ),
              }
            : c
        )
      );
      toast.success("Item updated");
      setEditingItemId(null);
      setItemNameDraft("");
    } catch {
      toast.error("Failed to update item");
    }
  };

  const startEditingItem = (id, currentName) => {
    setEditingItemId(id);
    setItemNameDraft(currentName);
  };

  const cancelEditingItem = () => {
    setEditingItemId(null);
    setItemNameDraft("");
  };

  const updateItemQuantity = async (id, qty, categoryId) => {
    if (qty < 0) return; // no negative quantity
    try {
      const updated = await updateItemQuantityApi(id, qty);
      setCategories(
        categories.map((c) =>
          c._id === categoryId
            ? {
                ...c,
                items: c.items.map((i) =>
                  i._id === id ? { ...i, quantity: updated.quantity } : i
                ),
              }
            : c
        )
      );
      toast.success("Item quantity updated");
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleDeleteItem = async (id, categoryId) => {
    setConfirmModalOpen(false);
    try {
      await deleteItemApi(id);
      setCategories(
        categories.map((c) =>
          c._id === categoryId
            ? { ...c, items: c.items.filter((i) => i._id !== id) }
            : c
        )
      );
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const toggleShowItems = (id) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <>
      {categories.map((cat) => {
        // Treat undefined or false as closed, only true means open
        const isShown = expandedCategories.has(cat._id);

        return (
          <div
            key={cat._id}
            className="mb-6 rounded-lg border border-gray-300 shadow-sm overflow-hidden"
          >
            {/* Category Header */}
            <div className="flex justify-between items-center bg-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {editingCategoryId === cat._id ? (
                  <>
                    <input
                      type="text"
                      className="flex-1 p-2 border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                      text-gray-700 truncate"
                      value={categoryNameDraft}
                      onChange={(e) => setCategoryNameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveCategoryName(cat._id);
                        if (e.key === "Escape") cancelEditingCategory();
                      }}
                      autoFocus
                    />
                  </>
                ) : (
                  <h3
                    className="font-semibold text-lg sm:text-xl truncate select-text"
                    title={cat.name}
                  >
                    {cat.name}
                  </h3>
                )}
              </div>

              <div className="flex items-center gap-2">
                {editingCategoryId === cat._id ? (
                  <>
                    <motion.button
                      onClick={() => saveCategoryName(cat._id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Save Category"
                      className="p-2 rounded hover:bg-blue-200 transition"
                    >
                      <FaSave className="text-blue-600" size={18} />
                    </motion.button>
                    <motion.button
                      onClick={cancelEditingCategory}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Cancel Editing Category"
                      className="p-2 rounded hover:bg-gray-200 transition"
                    >
                      ✕
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      onClick={() => startEditingCategory(cat._id, cat.name)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Edit Category"
                      className="p-2 rounded hover:bg-blue-200 transition"
                    >
                      <FaEdit className="text-blue-600" size={18} />
                    </motion.button>
                    <motion.button
                      onClick={() => confirmDeleteCategory(cat._id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Delete Category"
                      className="p-2 rounded hover:bg-red-200 text-red-600 transition"
                    >
                      <FaTrash size={18} />
                    </motion.button>
                    <motion.button
                      onClick={() => toggleShowItems(cat._id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={isShown ? "Hide Items" : "Show Items"}
                      className="p-2 rounded hover:bg-gray-200 transition"
                    >
                      {isShown ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            {/* Items List */}
            <AnimatePresence initial={false}>
              {isShown && (
                <motion.div
                  key="items"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="bg-white p-4 space-y-3 sm:space-y-4"
                >
                  {cat.items.length === 0 && (
                    <p className="text-gray-500 italic">
                      No items in this category.
                    </p>
                  )}
                  {cat.items.map((item) => {
                    const isEditing = editingItemId === item._id;
                    return (
                      <div
                        key={item._id}
                        className="flex flex-col sm:flex-row justify-between items-center gap-3 border rounded p-3"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {isEditing ? (
                            <input
                              type="text"
                              className="flex-1 p-2 border border-green-400 rounded-md
                              focus:outline-none focus:ring-2 focus:ring-green-500
                              text-gray-700 truncate"
                              value={itemNameDraft}
                              onChange={(e) => setItemNameDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  saveItemName(item._id, cat._id);
                                if (e.key === "Escape") cancelEditingItem();
                              }}
                              autoFocus
                            />
                          ) : (
                            <span
                              className="truncate select-text"
                              title={item.name}
                            >
                              {item.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <motion.button
                                onClick={() => saveItemName(item._id, cat._id)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Save Item Name"
                                className="p-2 rounded hover:bg-green-200 transition"
                              >
                                <FaSave className="text-green-600" size={16} />
                              </motion.button>
                              <motion.button
                                onClick={cancelEditingItem}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Cancel Editing Item"
                                className="p-2 rounded hover:bg-gray-200 transition"
                              >
                                ✕
                              </motion.button>
                            </>
                          ) : (
                            <>
                              <motion.button
                                onClick={() =>
                                  startEditingItem(item._id, item.name)
                                }
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Edit Item Name"
                                className="p-2 rounded hover:bg-green-200 transition"
                              >
                                <FaEdit className="text-green-600" size={16} />
                              </motion.button>

                              <motion.button
                                onClick={() =>
                                  updateItemQuantity(
                                    item._id,
                                    item.quantity - 1,
                                    cat._id
                                  )
                                }
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Decrease Quantity"
                                className="p-2 rounded hover:bg-red-200 text-red-600 transition select-none"
                              >
                                <FaMinus />
                              </motion.button>

                              <span className="w-8 text-center font-mono">
                                {item.quantity}
                              </span>

                              <motion.button
                                onClick={() =>
                                  updateItemQuantity(
                                    item._id,
                                    item.quantity + 1,
                                    cat._id
                                  )
                                }
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Increase Quantity"
                                className="p-2 rounded hover:bg-green-200 text-green-600 transition select-none"
                              >
                                <FaPlus />
                              </motion.button>

                              <motion.button
                                onClick={() =>
                                  confirmDeleteItem(item._id, cat._id)
                                }
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Delete Item"
                                className="p-2 rounded hover:bg-red-200 text-red-600 transition"
                              >
                                <FaTrash size={16} />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      <ConfirmModal
        isOpen={confirmModalOpen}
        title={confirmModalData.title}
        message={confirmModalData.message}
        onConfirm={confirmModalData.onConfirm}
        onCancel={() => setConfirmModalOpen(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
