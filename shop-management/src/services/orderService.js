// src/services/orderService.js
import axiosInstance from "../utils/axiosInstance";

// Fetch all categories
export const fetchCategories = async () => {
  const { data } = await axiosInstance.get("/api/categories");
  return data;
};

// Fetch items for a specific categoryId
export const fetchItemsByCategory = async (categoryId) => {
  const { data } = await axiosInstance.get(`/api/items?categoryId=${categoryId}`);
  return data;
};

// Reset all item quantities to zero
export const resetQuantities = async () => {
  const { data } = await axiosInstance.post("/api/orders/reset-quantities");
  return data;
};

export const placeOrder = async ({ email, message, items }) => {
  const { data } = await axiosInstance.post("/api/orders/place", {
    email,
    message,
    items,
  });
  return data;
};

// Update quantity of a specific item
export const updateItemQuantity = async (itemId, quantity) => {
  const { data } = await axiosInstance.patch(`/api/items/${itemId}/quantity`, {
    quantity,
  });
  return data;
};

export const verifyAndSendOrder = async (orderId) => {
  const { data } = await axiosInstance.post(`/api/orders/verify-and-send/${orderId}`);
  return data;
};