// src/components/GuestRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Chặn người đã đăng nhập truy cập các route như: /login, /register, v.v.
 * Nếu đã có token => redirect đến /dashboard (hoặc bất kỳ trang chính nào).
 */
export default function GuestRoute({ children, redirectTo = "/dashboard" }) {
  const token = localStorage.getItem("token");

  return token ? <Navigate to={redirectTo} replace /> : children;
}
