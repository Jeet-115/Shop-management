import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const authData = localStorage.getItem("auth");

  if (!authData) {
    // No auth object stored
    return <Navigate to="/" replace />;
  }

  try {
    const { token, expiry } = JSON.parse(authData);

    // Check if token exists and is not expired
    if (!token || Date.now() > expiry) {
      localStorage.removeItem("auth");
      return <Navigate to="/" replace />;
    }

    // ✅ Valid token, allow access
    return children;
  } catch {
    // If parsing fails, clear and redirect
    localStorage.removeItem("auth");
    return <Navigate to="/" replace />;
  }
}
