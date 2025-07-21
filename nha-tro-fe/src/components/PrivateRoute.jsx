import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export default function PrivateRoute({ children }) {
  const { currentUser } = useUser();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const role = currentUser.role;

  // Nếu là route admin thì chỉ cho ADMIN vào
  if (location.pathname.startsWith("/admin") && role !== "ADMIN") {
    return <Navigate to="/unauthorized" replace />;
  }

  // Nếu không phải admin, vẫn cho vào các route khác
  return children;
}
