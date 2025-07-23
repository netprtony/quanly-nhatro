import React, { useState } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TypeRooms() {
  // Mock dữ liệu loại phòng
  const [typeRooms, setTypeRooms] = useState([
    {
      room_type_id: 1,
      type_name: "Phòng đơn",
      price_per_month: 2500000,
      description: "Phòng cho 1 người, đầy đủ tiện nghi.",
    },
    {
      room_type_id: 2,
      type_name: "Phòng đôi",
      price_per_month: 3500000,
      description: "Phòng cho 2 người, rộng rãi, có ban công.",
    },
    {
      room_type_id: 3,
      type_name: "Phòng gia đình",
      price_per_month: 5000000,
      description: "Phòng lớn cho gia đình, có bếp riêng.",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [form, setForm] = useState({
    type_name: "",
    price_per_month: "",
    description: "",
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);

  const columns = [
    { label: "Mã loại", accessor: "room_type_id" },
    { label: "Tên loại phòng", accessor: "type_name" },
    {
      label: "Giá phòng",
      accessor: "price_per_month",
      render: (value) =>
        typeof value === "number"
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value)
          : "N/A",
    },
    { label: "Mô tả", accessor: "description" },
    {
      label: "Thao tác",
      accessor: "actions",
      render: (_, type) => (
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(type)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(type.room_type_id)}>Xóa</button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setForm({
      type_name: "",
      price_per_month: "",
      description: "",
    });
    setEditingType(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (type) => {
    setForm({
      type_name: type.type_name,
      price_per_month: type.price_per_month,
      description: type.description || "",
    });
    setEditingType(type);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (typeId) => {
    setTypeToDelete(typeId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    setTypeRooms((prev) => prev.filter((t) => t.room_type_id !== typeToDelete));
    toast.success("🗑️ Xóa loại phòng thành công!");
    setShowConfirmDelete(false);
    setTypeToDelete(null);
  };

  const handleSubmitType = () => {
    if (editingType) {
      // Sửa loại phòng
      setTypeRooms((prev) =>
        prev.map((t) =>
          t.room_type_id === editingType.room_type_id
            ? { ...t, ...form }
            : t
        )
      );
      toast.success("✏️ Cập nhật loại phòng thành công!");
    } else {
      // Thêm loại phòng mới
      setTypeRooms((prev) => [
        ...prev,
        {
          ...form,
          room_type_id: prev.length ? Math.max(...prev.map((t) => t.room_type_id)) + 1 : 1,
        },
      ]);
      toast.success("✅ Thêm loại phòng thành công!");
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
        <h3 className="mb-3">🏷️ Danh sách loại phòng</h3>
        <button className="btn btn-success mb-3" onClick={handleAdd}>
          ➕ Thêm loại phòng
        </button>

        <Table columns={columns} data={typeRooms} />

        {/* Modal Thêm / Sửa */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingType ? "✏️ Chỉnh sửa loại phòng" : "➕ Thêm loại phòng"}
          showConfirm
          onConfirm={handleSubmitType}
        >
          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Tên loại phòng</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.type_name}
                  onChange={(e) => handleFormChange("type_name", e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Giá phòng (VND)</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.price_per_month}
                  onChange={(e) => handleFormChange("price_per_month", parseInt(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">Mô tả</label>
                <textarea
                  className="form-control"
                  value={form.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </form>
        </Modal>

        {/* Modal xác nhận xóa */}
        <ModalConfirm
          isOpen={showConfirmDelete}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa loại phòng này không?"
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