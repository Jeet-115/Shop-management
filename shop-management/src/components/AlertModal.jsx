import { motion, AnimatePresence } from "framer-motion";

export default function AlertModal({ 
  isOpen, 
  title = "Alert", 
  message, 
  onClose, 
  closeText = "OK" 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 mx-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="alert-dialog-title"
          >
            <h2 id="alert-dialog-title" className="text-lg font-semibold mb-3 text-gray-900">
              {title}
            </h2>
            <p className="text-gray-700 mb-6">{message}</p>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition font-semibold"
                autoFocus
              >
                {closeText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
