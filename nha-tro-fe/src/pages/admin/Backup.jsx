import React, { useState } from "react";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BACKUP_API = "http://localhost:8000/backup/backup";

export default function Backup() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBackup = () => {
    setShowConfirm(true);
  };

  const handleConfirmBackup = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const res = await fetch(BACKUP_API, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Sao lưu dữ liệu thành công!");
        toast.info(`File: ${data.dump_file}`);
      } else {
        toast.error("Sao lưu thất bại: " + (data.detail || "Lỗi không xác định"));
      }
    } catch (err) {
      toast.error("Sao lưu thất bại!");
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4 position-relative">
      <div className="p-4 rounded shadow bg-white text-center">
        <h3 className="mb-3">💾 Sao lưu dữ liệu hệ thống</h3>
        <p>Bạn có thể sao lưu toàn bộ dữ liệu hệ thống về file an toàn.</p>
        <button className="btn btn-primary" onClick={handleBackup} disabled={loading}>
          {loading ? "Đang sao lưu..." : "💾 Sao lưu dữ liệu"}
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