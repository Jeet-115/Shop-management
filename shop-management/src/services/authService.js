import axiosInstance from "../utils/axiosInstance";

export const loginAdmin = async (credentials) => {
  const response = await axiosInstance.post("/api/admin/login", credentials);
  return response.data; // { token }
};