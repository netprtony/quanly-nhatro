import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
 const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
