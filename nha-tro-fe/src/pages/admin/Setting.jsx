import React, { useState } from "react";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Setting() {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [settingValue, setSettingValue] = useState("Nhà trọ Bảo Bảo");

  const [form, setForm] = useState({
    siteName: settingValue,
  });

  const handleOpenModal = () => {
    setForm({ siteName: settingValue });
    setShowModal(true);
  };

  const handleSave = () => {
    setSettingValue(form.siteName);
    setShowModal(false);
    toast.success("✅ Đã lưu thay đổi cài đặt!");
  };

  const handleOpenConfirm = () => {
    setShowConfirm(true);
  };

  const handleReset = () => {
    setSettingValue("Nhà trọ Bảo Bảo");
    setShowConfirm(false);
    toast.info("🔄 Đã khôi phục mặc định!");
  };

  return (
    <div className="container mt-4 position-relative">
      <div className="p-4 rounded shadow bg-white">
        <h3 className="mb-3">⚙️ Cài đặt hệ thống</h3>
        <div className="mb-3">
          <label className="form-label fw-bold">Tên website:</label>
          <span className="ms-2">{settingValue}</span>
        </div>
        <button className="btn btn-primary me-2" onClick={handleOpenModal}>
          ✏️ Đổi tên website
        </button>
        <button className="btn btn-danger" onClick={handleOpenConfirm}>
          🔄 Khôi phục mặc định
        </button>
      </div>

      {/* Modal chỉnh sửa tên website */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="✏️ Đổi tên website"
        showConfirm
        onConfirm={handleSave}
      >
        <form>
          <div className="mb-3">
            <label className="form-label">Tên website mới</label>
            <input
              type="text"
              className="form-control"
              value={form.siteName}
              onChange={(e) => setForm({ siteName: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Modal xác nhận khôi phục mặc định */}
      <ModalConfirm
        isOpen={showConfirm}
        title="Khôi phục mặc định"
        message="Bạn có chắc chắn muốn khôi phục tên website về mặc định không?"
        confirmText="Khôi phục"
        cancelText="Hủy"
        onConfirm={handleReset}
        onClose={() => setShowConfirm(false)}
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}