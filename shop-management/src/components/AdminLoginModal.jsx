import React, { useState } from "react";
import { loginAdmin } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaLock, FaEnvelope } from "react-icons/fa";

export default function AdminLoginModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token } = await loginAdmin({ email, password });
      localStorage.setItem("token", token);

      // Small delay for animation effect
      setTimeout(() => {
        navigate("/admin");
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-modal="true"
        role="dialog"
        aria-labelledby="admin-login-title"
      >
        <motion.div
          className="bg-white rounded-lg shadow-lg w-11/12 max-w-sm p-6 relative"
          initial={{ scale: 0.8, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50"
            aria-label="Close login modal"
            type="button"
          >
            <FaTimes size={20} />
          </button>

          <h2
            id="admin-login-title"
            className="text-xl font-semibold mb-6 text-center text-gray-800"
          >
            Admin Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                className="border border-gray-300 rounded-md pl-10 pr-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                className="border border-gray-300 rounded-md pl-10 pr-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center" role="alert">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition font-medium disabled:opacity-50"
              >
                Cancel
              </button>

              <motion.button
                whileTap={!loading ? { scale: 0.95 } : {}}
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {!loading ? (
                  "Login"
                ) : (
                  <motion.div
                    className="flex gap-1"
                    initial="start"
                    animate="end"
                    variants={{
                      start: { transition: { staggerChildren: 0.1 } },
                      end: { transition: { staggerChildren: 0.1 } },
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-2 h-2 bg-white rounded-full"
                        variants={{
                          start: { y: "0%" },
                          end: {
                            y: ["0%", "-50%", "0%"],
                            transition: {
                              duration: 0.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            },
                          },
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
