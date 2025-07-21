import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layouts/Layout";
import AdminLayout from "./layouts/AdminLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/user/Home";

import Dashboard from "./pages/admin/Dashboard";
import Rooms from "./pages/admin/Rooms";

import PrivateRoute from "./components/PrivateRoute";
import GuestRoute from "./components/GuestRoute";

function App() {
  return (
    <Routes>
      {/* ----------- CLIENT LAYOUT ----------- */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        {/* Thêm các route người dùng khác ở đây nếu cần */}
      </Route>

      {/* ----------- ADMIN LAYOUT ----------- */}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="rooms" element={<Rooms />} />
        {/* Các route admin khác */}
      </Route>

      {/* ----------- FALLBACK ----------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
