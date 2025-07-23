import React, { useState } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Electricity() {
  // Mock dữ liệu hóa đơn điện
  const [electricities, setElectricities] = useState([
    {
      electricity_id: 1,
      room_number: "101",
      month: "2024-06",
      old_index: 320,
      new_index: 350,
      price_per_kwh: 3500,
      note: "Chỉ số đầu tháng 6",
    },
    {
      electricity_id: 2,
      room_number: "202",
      month: "2024-06",
      old_index: 410,
      new_index: 430,
      price_per_kwh: 3500,
      note: "",
    },
    {
      electricity_id: 3,
      room_number: "303",
      month: "2024-06",
      old_index: 150,
      new_index: 170,
      price_per_kwh: 3500,
      note: "",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingElectricity, setEditingElectricity] = useState(null);
  const [form, setForm] = useState({
    room_number: "",
    month: "",
    old_index: "",
    new_index: "",
    price_per_kwh: 3500,
    note: "",
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [electricityToDelete, setElectricityToDelete] = useState(null);

  const columns = [
    { label: "ID", accessor: "electricity_id" },
    { label: "Phòng", accessor: "room_number" },
    { label: "Tháng", accessor: "month" },
    { label: "Chỉ số cũ", accessor: "old_index" },
    { label: "Chỉ số mới", accessor: "new_index" },
    {
      label: "Số kWh",
      accessor: "calc_kwh",
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
            }).format((row.new_index - row.old_index) * row.price_per_kwh)
          : "N/A",
    },
    {
      label: "Đơn giá (kWh)",
      accessor: "price_per_kwh",
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
      render: (_, electricity) => (
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(electricity)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(electricity.electricity_id)}>Xóa</button>
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
      price_per_kwh: 3500,
      note: "",
    });
    setEditingElectricity(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (electricity) => {
    setForm({
      room_number: electricity.room_number,
      month: electricity.month,
      old_index: electricity.old_index,
      new_index: electricity.new_index,
      price_per_kwh: electricity.price_per_kwh,
      note: electricity.note || "",
    });
    setEditingElectricity(electricity);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (electricityId) => {
    setElectricityToDelete(electricityId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    setElectricities((prev) => prev.filter((e) => e.electricity_id !== electricityToDelete));
    toast.success("🗑️ Xóa hóa đơn điện thành công!");
    setShowConfirmDelete(false);
    setElectricityToDelete(null);
  };

  const handleSubmitElectricity = () => {
    if (editingElectricity) {
      // Sửa hóa đơn điện
      setElectricities((prev) =>
        prev.map((e) =>
          e.electricity_id === editingElectricity.electricity_id
            ? { ...e, ...form }
            : e
        )
      );
      toast.success("✏️ Cập nhật hóa đơn điện thành công!");
    } else {
      // Thêm hóa đơn điện mới
      setElectricities((prev) => [
        ...prev,
        {
          ...form,
          electricity_id: prev.length ? Math.max(...prev.map((e) => e.electricity_id)) + 1 : 1,
        },
      ]);
      toast.success("✅ Thêm hóa đơn điện thành công!");
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
        <h3 className="mb-3">⚡ Quản lý điện</h3>
        <button className="btn btn-success mb-3" onClick={handleAdd}>
          ➕ Thêm hóa đơn điện
        </button>

        <Table columns={columns} data={electricities} />

        {/* Modal Thêm / Sửa */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingElectricity ? "✏️ Chỉnh sửa hóa đơn điện" : "➕ Thêm hóa đơn điện"}
          showConfirm
          onConfirm={handleSubmitElectricity}
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
                <label className="form-label">Đơn giá (VND/kWh)</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.price_per_kwh}
                  onChange={(e) => handleFormChange("price_per_kwh", parseInt(e.target.value) || 0)}
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
          message="Bạn có chắc chắn muốn xóa hóa đơn điện này không?"
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