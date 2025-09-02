import { motion } from "framer-motion";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function EditButton({ onLoginRequired }) {
  const navigate = useNavigate();

  const handleEditClick = () => {
  const authData = localStorage.getItem("auth");
  if (authData) {
    const { expiry } = JSON.parse(authData);
    if (Date.now() > expiry) {
      localStorage.removeItem("auth");
      onLoginRequired();
      return;
    }
    navigate("/admin");
  } else {
    onLoginRequired();
  }
};

  return (
    <motion.button
      onClick={handleEditClick}
      whileHover={{ scale: 1.1, boxShadow: "0 8px 15px rgba(59, 130, 246, 0.4)" }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-md font-semibold transition focus:outline-none focus:ring-4 focus:ring-blue-300 select-none"
      aria-label="Edit Inventory"
      type="button"
    >
      <FaEdit size={20} />
      <span className="text-lg tracking-wide">Edit</span>
    </motion.button>
  );
}
