import axiosInstance from "../utils/axiosInstance";

export const fetchCategories = async () => {
  const { data } = await axiosInstance.get("/api/categories");
  return data;
};

export const fetchItems = async () => {
  const { data } = await axiosInstance.get("/api/items");
  return data;
};

export const updateItemQuantity = async (itemId, quantity) => {
  const { data } = await axiosInstance.patch(`/api/items/${itemId}/quantity`, {
    quantity,
  });
  return data;
};