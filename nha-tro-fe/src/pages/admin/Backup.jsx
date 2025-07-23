import React, { useState } from "react";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Backup() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBackup = () => {
    setShowConfirm(true);
  };

  const handleConfirmBackup = () => {
    setShowConfirm(false);
    toast.success("✅ Sao lưu dữ liệu thành công!");
    // Thực tế sẽ gọi API sao lưu ở đây
  };

  return (
    <div className="container mt-4 position-relative">
      <div className="p-4 rounded shadow bg-white text-center">
        <h3 className="mb-3">💾 Sao lưu dữ liệu hệ thống</h3>
        <p>Bạn có thể sao lưu toàn bộ dữ liệu hệ thống về file an toàn.</p>
        <button className="btn btn-primary" onClick={handleBackup}>
          💾 Sao lưu dữ liệu
        </button>
      </div>

      <ModalConfirm
        isOpen={showConfirm}
        title="Xác nhận sao lưu"
        message="Bạn có chắc chắn muốn sao lưu dữ liệu không?"
        confirmText="Sao lưu"
        cancelText="Hủy"
        onConfirm={handleConfirmBackup}
        onClose={() => setShowConfirm(false)}
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}