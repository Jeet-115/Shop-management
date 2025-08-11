import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { fetchOrdersApi } from "../services/adminService";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({}); // track expanded state by order ID

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const ordersData = await fetchOrdersApi();
      setOrders(ordersData);
    } catch {
      toast.error("Failed to load orders");
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center sm:text-left">Orders History</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center">No orders found.</p>
      ) : (
        <>
          {/* Desktop / Tablet Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 shadow-sm rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-gray-700 select-none">
                  <th className="p-3 border border-gray-300 text-left">Order ID</th>
                  <th className="p-3 border border-gray-300 text-left">Email</th>
                  <th className="p-3 border border-gray-300 text-left">Message</th>
                  <th className="p-3 border border-gray-300 text-left">Items</th>
                  <th className="p-3 border border-gray-300 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isExpanded = expandedOrders[order._id];
                  return (
                    <tr key={order._id} className="border-t border-gray-300">
                      <td className="p-3 border border-gray-300 font-mono text-sm">{order._id}</td>
                      <td className="p-3 border border-gray-300 text-sm">{order.email}</td>
                      <td className="p-3 border border-gray-300 text-sm whitespace-pre-wrap">
                        {order.message || "-"}
                      </td>
                      <td className="p-3 border border-gray-300 text-sm max-w-xs">
                        <button
                          onClick={() => toggleExpand(order._id)}
                          className="flex items-center gap-1 text-blue-600 hover:underline focus:outline-none"
                          aria-expanded={isExpanded}
                          aria-controls={`items-${order._id}`}
                        >
                          {isExpanded ? "Hide Items" : `Show Items (${order.items.length})`}
                          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                        </button>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              id={`items-${order._id}`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-2 space-y-1 pl-4 text-gray-700 bg-gray-50 rounded border border-gray-200"
                            >
                              {order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="text-sm flex justify-between items-center"
                                >
                                  <span>{item.category} - {item.name}</span>
                                  <span className="font-mono">{item.quantity}x</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                      <td className="p-3 border border-gray-300 text-sm whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrders[order._id];
              return (
                <motion.div
                  key={order._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-mono text-sm break-all">{order._id}</h3>
                    <button
                      onClick={() => toggleExpand(order._id)}
                      aria-expanded={isExpanded}
                      aria-controls={`mobile-items-${order._id}`}
                      className="p-1 rounded hover:bg-gray-200 focus:outline-none"
                    >
                      {isExpanded ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
                    </button>
                  </div>

                  <p className="text-sm mb-1"><strong>Email:</strong> {order.email}</p>
                  <p className="text-sm mb-1"><strong>Message:</strong> {order.message || "-"}</p>
                  <p className="text-sm mb-1"><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        id={`mobile-items-${order._id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-2 border-t border-gray-200 pt-2"
                      >
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-gray-700 text-sm py-1"
                          >
                            <span>{item.category} - {item.name}</span>
                            <span className="font-mono">{item.quantity}x</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
