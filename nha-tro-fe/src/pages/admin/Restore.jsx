import React, { useState } from "react";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Restore() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRestore = () => {
    setShowConfirm(true);
  };

  const handleConfirmRestore = () => {
    setShowConfirm(false);
    toast.success("✅ Phục hồi dữ liệu thành công!");
    // Thực tế sẽ gọi API phục hồi ở đây
  };

  return (
    <div className="container mt-4 position-relative">
      <div className="p-4 rounded shadow bg-white text-center">
        <h3 className="mb-3">🔄 Phục hồi dữ liệu hệ thống</h3>
        <p>Bạn có thể phục hồi dữ liệu về trạng thái gần nhất đã sao lưu.</p>
        <button className="btn btn-warning" onClick={handleRestore}>
          🔄 Phục hồi dữ liệu
        </button>
      </div>

      <ModalConfirm
        isOpen={showConfirm}
        title="Xác nhận phục hồi"
        message="Bạn có chắc chắn muốn phục hồi dữ liệu không? Thao tác này không thể hoàn tác."
        confirmText="Phục hồi"
        cancelText="Hủy"
        onConfirm={handleConfirmRestore}
        onClose={() => setShowConfirm(false)}
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}