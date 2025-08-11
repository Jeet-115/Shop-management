import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaPaperPlane, FaSpinner } from "react-icons/fa";

export default function PlaceOrderModal({ email, setEmail, message, setMessage, onClose, onSubmit }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // prevent multiple submits
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="place-order-title"
    >
      <motion.div
        className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
          type="button"
          disabled={submitting}
        >
          <FaTimes size={20} />
        </button>

        <h2 id="place-order-title" className="text-xl font-semibold mb-6 text-gray-800 text-center">
          Place Order
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            aria-label="Email address"
            disabled={submitting}
          />

          <textarea
            placeholder="Enter message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            aria-label="Message"
            disabled={submitting}
          />

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition font-medium"
              disabled={submitting}
            >
              Cancel
            </button>

            <motion.button
              type="submit"
              whileHover={!submitting ? { scale: 1.05 } : {}}
              whileTap={!submitting ? { scale: 0.95 } : {}}
              className={`flex items-center gap-2 rounded px-5 py-2 font-semibold transition
                ${submitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
              aria-label="Submit order"
              disabled={submitting}
            >
              {submitting ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaPaperPlane />
              )}
              {submitting ? "Submitting..." : "Submit"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
