import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/AdminHeader";

export default function AdminLayout() {
  return (
    <div className="d-flex">
      {/* Sidebar bên trái */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-grow-1">
        <Header />
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
