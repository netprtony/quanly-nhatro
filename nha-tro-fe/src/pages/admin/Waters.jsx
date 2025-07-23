import React, { useState } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Waters() {
  // Mock dữ liệu hóa đơn nước
  const [waters, setWaters] = useState([
    {
      water_id: 1,
      room_number: "101",
      month: "2024-06",
      old_index: 120,
      new_index: 135,
      price_per_m3: 15000,
      note: "Chỉ số đầu tháng 6",
    },
    {
      water_id: 2,
      room_number: "202",
      month: "2024-06",
      old_index: 200,
      new_index: 215,
      price_per_m3: 15000,
      note: "",
    },
    {
      water_id: 3,
      room_number: "303",
      month: "2024-06",
      old_index: 90,
      new_index: 100,
      price_per_m3: 15000,
      note: "",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingWater, setEditingWater] = useState(null);
  const [form, setForm] = useState({
    room_number: "",
    month: "",
    old_index: "",
    new_index: "",
    price_per_m3: 15000,
    note: "",
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [waterToDelete, setWaterToDelete] = useState(null);

  const columns = [
    { label: "ID", accessor: "water_id" },
    { label: "Phòng", accessor: "room_number" },
    { label: "Tháng", accessor: "month" },
    { label: "Chỉ số cũ", accessor: "old_index" },
    { label: "Chỉ số mới", accessor: "new_index" },
    {
      label: "Số m³",
      accessor: "calc_m3",
      render: (_, row) => row.new_index - row.old_index,
    },
    {
      label: "Thành tiền",
      accessor: "calc_total",
      render: (_, row) =>
        typeof row.new_index === "number" && typeof row.old_index === "number"
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format((row.new_index - row.old_index) * row.price_per_m3)
          : "N/A",
    },
    {
      label: "Đơn giá (m³)",
      accessor: "price_per_m3",
      render: (value) =>
        typeof value === "number"
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value)
          : "N/A",
    },
    { label: "Ghi chú", accessor: "note" },
    {
      label: "Thao tác",
      accessor: "actions",
      render: (_, water) => (
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(water)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(water.water_id)}>Xóa</button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setForm({
      room_number: "",
      month: "",
      old_index: "",
      new_index: "",
      price_per_m3: 15000,
      note: "",
    });
    setEditingWater(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (water) => {
    setForm({
      room_number: water.room_number,
      month: water.month,
      old_index: water.old_index,
      new_index: water.new_index,
      price_per_m3: water.price_per_m3,
      note: water.note || "",
    });
    setEditingWater(water);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (waterId) => {
    setWaterToDelete(waterId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    setWaters((prev) => prev.filter((w) => w.water_id !== waterToDelete));
    toast.success("🗑️ Xóa hóa đơn nước thành công!");
    setShowConfirmDelete(false);
    setWaterToDelete(null);
  };

  const handleSubmitWater = () => {
    if (editingWater) {
      // Sửa hóa đơn nước
      setWaters((prev) =>
        prev.map((w) =>
          w.water_id === editingWater.water_id
            ? { ...w, ...form }
            : w
        )
      );
      toast.success("✏️ Cập nhật hóa đơn nước thành công!");
    } else {
      // Thêm hóa đơn nước mới
      setWaters((prev) => [
        ...prev,
        {
          ...form,
          water_id: prev.length ? Math.max(...prev.map((w) => w.water_id)) + 1 : 1,
        },
      ]);
      toast.success("✅ Thêm hóa đơn nước thành công!");
    }
    setShowModal(false);
  };

  const handleCloseModal = () => {
    if (unsavedChanges) {
      setShowConfirmExit(true);
    } else {
      setShowModal(false);
    }
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  return (
    <div className="container mt-4 position-relative">
      <div className="p-4 rounded shadow bg-white">
        <h3 className="mb-3">🚰 Quản lý nước</h3>
        <button className="btn btn-success mb-3" onClick={handleAdd}>
          ➕ Thêm hóa đơn nước
        </button>

        <Table columns={columns} data={waters} />

        {/* Modal Thêm / Sửa */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingWater ? "✏️ Chỉnh sửa hóa đơn nước" : "➕ Thêm hóa đơn nước"}
          showConfirm
          onConfirm={handleSubmitWater}
        >
          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Phòng</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.room_number}
                  onChange={(e) => handleFormChange("room_number", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Tháng</label>
                <input
                  type="month"
                  className="form-control"
                  value={form.month}
                  onChange={(e) => handleFormChange("month", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Chỉ số cũ</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.old_index}
                  onChange={(e) => handleFormChange("old_index", parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Chỉ số mới</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.new_index}
                  onChange={(e) => handleFormChange("new_index", parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Đơn giá (VND/m³)</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.price_per_m3}
                  onChange={(e) => handleFormChange("price_per_m3", parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label">Ghi chú</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.note}
                  onChange={(e) => handleFormChange("note", e.target.value)}
                />
              </div>
            </div>
          </form>
        </Modal>

        {/* Modal xác nhận xóa */}
        <ModalConfirm
          isOpen={showConfirmDelete}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa hóa đơn nước này không?"
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={confirmDelete}
          onClose={() => setShowConfirmDelete(false)}
        />

        {/* Modal xác nhận thoát khi có thay đổi */}
        <ModalConfirm
          isOpen={showConfirmExit}
          title="Thoát mà chưa lưu?"
          message="Bạn có thay đổi chưa được lưu. Thoát không?"
          confirmText="Thoát"
          cancelText="Ở lại"
          onConfirm={() => {
            setShowModal(false);
            setShowConfirmExit(false);
            setUnsavedChanges(false);
          }}
          onClose={() => setShowConfirmExit(false)}
        />
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}