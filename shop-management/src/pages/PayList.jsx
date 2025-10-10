import { useEffect, useState } from "react";
import {
  fetchPayListApi,
  addPayListEntryApi,
  togglePayListDeleteApi,
  deletePayListApi,
  fetchTotalAmountApi,
} from "../services/payListService";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaTrash,
  FaCheckCircle,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";

export default function PayList() {
  const [payList, setPayList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    date: "",
    checkNo: "",
    paidTo: "",
    amount: "",
  });
  const [totalAmount, setTotalAmount] = useState(0);

  // Fetch pay list entries
  const loadPayList = async () => {
    setLoading(true);
    try {
      const data = await fetchPayListApi();
      setPayList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTotalAmount = async () => {
    try {
      const { totalAmount } = await fetchTotalAmountApi();
      setTotalAmount(totalAmount);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPayList();
    loadTotalAmount();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.checkNo || !form.paidTo || !form.amount) return;

    try {
      await addPayListEntryApi({
        date: form.date,
        checkNo: form.checkNo,
        paidTo: form.paidTo,
        amount: parseFloat(form.amount),
      });
      setForm({ date: "", checkNo: "", paidTo: "", amount: "" });
      setShowForm(false); // close form after submit
      loadPayList();
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle soft delete
  const handleToggleDelete = async (id) => {
    try {
      const { totalAmount } = await togglePayListDeleteApi(id);
      await loadPayList();
      setTotalAmount(totalAmount);
    } catch (err) {
      console.error(err);
    }
  };

  // Permanent delete
  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to permanently delete this entry?")
    )
      return;

    try {
      await deletePayListApi(id);
      loadPayList();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-10">
      <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-gray-800">Pay List</h2>
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowForm((prev) => !prev)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            <FaPlus /> {showForm ? "Close Form" : "Enter Details"}
          </motion.button>
        </div>

        {/* Animated Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-xl shadow mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                required
              />
              <input
                type="text"
                name="checkNo"
                placeholder="Check No."
                value={form.checkNo}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                required
              />
              <input
                type="text"
                name="paidTo"
                placeholder="Paid To"
                value={form.paidTo}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                required
              />
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={form.amount}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                required
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className="col-span-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <FaCheckCircle /> Add Entry
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Table */}
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 border">Date</th>
                  <th className="px-4 py-3 border">Check No.</th>
                  <th className="px-4 py-3 border">Paid To</th>
                  <th className="px-4 py-3 border">Amount</th>
                  <th className="px-4 py-3 border">Soft Delete</th>
                  {/* <th className="px-4 py-3 border">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {payList.map((entry) => (
                  <motion.tr
                    key={entry._id}
                    className="text-center border-t"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-4 py-2">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">{entry.checkNo}</td>
                    <td className="px-4 py-2">{entry.paidTo}</td>
                    <td className="px-4 py-2 font-semibold">
                      ${entry.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={entry.isDeleted}
                        onChange={() => handleToggleDelete(entry._id)}
                        className="h-4 w-4"
                      />
                    </td>
                    {/* <td className="px-4 py-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(entry._id)}
                      className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      <FaTrash /> Delete
                    </motion.button>
                  </td> */}
                  </motion.tr>
                ))}
                {payList.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-gray-500">
                      No entries found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex justify-end items-center bg-gray-50 border-t p-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Total (Active Entries):{" "}
                <span className="text-green-600">
                  ${totalAmount.toFixed(2)}
                </span>
              </h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
