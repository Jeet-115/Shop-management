import { useState } from "react";
import { motion } from "framer-motion";
import { FaFileExcel, FaUpload } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { uploadExcelApi } from "../services/adminService";

export default function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please select an Excel file first");
    try {
      setUploading(true);
      const res = await uploadExcelApi(file);
      toast.success(res.message || "Excel imported successfully");
      setFile(null);
      onUploadSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to import Excel");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <motion.div
        className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-colors duration-300 ${
          dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="flex flex-col items-center gap-2 sm:gap-3"
        >
          <FaFileExcel className="text-green-600 text-3xl sm:text-4xl" />
          <span className="text-gray-700 font-medium text-sm sm:text-base break-words max-w-full">
            {file
              ? file.name
              : "Drag & drop your Excel file here, or click to browse"}
          </span>
        </label>
      </motion.div>

      {/* Upload Button */}
      <motion.button
        onClick={handleUpload}
        disabled={uploading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-full flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-3 rounded-lg font-medium shadow-md transition-colors duration-300 text-sm sm:text-base ${
          uploading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600"
        }`}
      >
        <FaUpload className="text-sm sm:text-base" />
        {uploading ? "Uploading..." : "Upload Excel"}
      </motion.button>
    </div>
  );
}
