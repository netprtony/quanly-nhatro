import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout({ children }) {
  return (
    <div className="d-flex">
      {/* Sidebar bên trái */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-grow-1">
        <Header />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
