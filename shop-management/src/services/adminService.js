import axiosInstance from "../utils/axiosInstance";

// Categories
export const fetchCategoriesApi = async () => {
  const { data } = await axiosInstance.get("/api/categories");
  return data;
};

export const fetchItemsByCategoryApi = async (categoryId) => {
  const { data } = await axiosInstance.get(
    `/api/items?categoryId=${categoryId}`
  );
  return data;
};

export const addCategoryApi = async (name) => {
  const { data } = await axiosInstance.post("/api/categories", { name });
  return data;
};

export const deleteCategoryApi = async (id) => {
  await axiosInstance.delete(`/api/categories/${id}`);
};

export const updateCategoryNameApi = async (id, name) => {
  const { data } = await axiosInstance.patch(`/api/categories/${id}`, { name });
  return data;
};

// Items
export const addItemApi = async (categoryId, name, quantity) => {
  const { data } = await axiosInstance.post("/api/items", {
    categoryId,
    name,
    quantity,
  });
  return data;
};

export const updateItemNameApi = async (id, name) => {
  await axiosInstance.patch(`/api/items/${id}`, { name });
};

export const updateItemQuantityApi = async (id, quantity) => {
  const { data } = await axiosInstance.patch(`/api/items/${id}/quantity`, {
    quantity,
  });
  return data;
};

export const deleteItemApi = async (id) => {
  await axiosInstance.delete(`/api/items/${id}`);
};

// Excel Upload
export const uploadExcelApi = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axiosInstance.post("/api/excel/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const fetchOrdersApi = async () => {
  const { data } = await axiosInstance.get("/api/orders/history");
  return data;
};
