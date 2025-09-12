import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./ProtectedRoute";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Order from "./pages/Order";
import PayList from "./pages/PayList";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/paylist"
            element={
              <ProtectedRoute>
                <PayList />
              </ProtectedRoute>
            }
          />
          <Route path="/order" element={<Order />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
