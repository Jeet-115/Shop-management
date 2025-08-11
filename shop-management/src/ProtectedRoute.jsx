import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // No token, redirect to home page
    return <Navigate to="/" replace />;
  }

  // Token found, render the children components (Admin)
  return children;
}
