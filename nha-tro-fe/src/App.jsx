import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layouts/Layout";
import AdminLayout from "./layouts/AdminLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/user/Home";
import RoomUser from "./pages/user/Rooms";
import DetailRoom from "./pages/user/DetailRoom";
import PaymentHistory from "./pages/user/PaymentHistory";
import Contract from "./pages/user/Contract";
import Invoice from "./pages/user/Invoice";

import Dashboard from "./pages/admin/Dashboard";
import Rooms from "./pages/admin/Rooms";
import TypeRooms from "./pages/admin/TypeRooms";
import Accounts from "./pages/admin/Accounts";
import Contracts from "./pages/admin/Contracts";
import Devices from "./pages/admin/Devices";
import Invoices from "./pages/admin/Invoices";
import Payments from "./pages/admin/Payments";
import Electricity from "./pages/admin/Electricity";
import Water from "./pages/admin/Waters";
import Setting from "./pages/admin/Setting";
import Tenants from "./pages/admin/Tenants";
import Reservations from "./pages/admin/Reservations";
import Backup from "./pages/admin/Backup";
import Restore from "./pages/admin/Restore";

import PrivateRoute from "./components/PrivateRoute";
import GuestRoute from "./components/GuestRoute";

function App() {
  return (
    <Routes>
      {/* ----------- LOGIN & REGISTER (NO LAYOUT) ----------- */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      {/* ----------- CLIENT LAYOUT ----------- */}
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <GuestRoute>
              <Home />
            </GuestRoute>
          }
        />
        <Route path="/home" element={<Home />} />
        <Route path="/rooms" element={<RoomUser />} />
        <Route path="/rooms/:roomId" element={<DetailRoom />} />
        <Route path="/history-payment" element={<PaymentHistory />} />
        <Route path="/contracts" element={<Contract />} />
        <Route path="/invoices" element={<Invoice />} />
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
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="type-rooms" element={<TypeRooms />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="tenants" element={<Tenants />}  />
        <Route path="contracts" element={<Contracts />} />
        <Route path="devices" element={<Devices />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="payments" element={<Payments />} />
        <Route path="water" element={<Water />} />
        <Route path="electricity" element={<Electricity />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="backup" element={<Backup />} />
        <Route path="restore" element={<Restore />} />
        <Route path="settings" element={<Setting />} />
        {/* Các route admin khác */}
      </Route>

      {/* ----------- FALLBACK ----------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
