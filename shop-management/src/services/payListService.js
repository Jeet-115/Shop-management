import axiosInstance from "../utils/axiosInstance";

// Fetch all pay list entries (excluding soft deleted)
export const fetchPayListApi = async () => {
  const { data } = await axiosInstance.get("/api/paylist");
  return data;
};

// Create a new pay list entry
export const addPayListEntryApi = async ({ date, checkNo, paidTo, amount }) => {
  const { data } = await axiosInstance.post("/api/paylist", {
    date,
    checkNo,
    paidTo,
    amount,
  });
  return data;
};

// Soft delete / restore a pay list entry (toggle)
export const togglePayListDeleteApi = async (id) => {
  const { data } = await axiosInstance.patch(`/api/paylist/${id}/toggle-delete`);
  return data;
};

// Permanently delete a pay list entry
export const deletePayListApi = async (id) => {
  await axiosInstance.delete(`/api/paylist/${id}`);
};

export const fetchTotalAmountApi = async () => {
  const { data } = await axiosInstance.get("/api/paylist/total");
  return data; // returns { totalAmount: number }
};