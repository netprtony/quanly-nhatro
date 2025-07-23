import React, { useState } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Reservations() {
  // Mock dữ liệu đặt phòng trước
  const [reservations, setReservations] = useState([
    {
      reservation_id: 1,
      full_name: "Nguyễn Văn G",
      phone: "0901111222",
      email: "guest1@example.com",
      room_type: "Phòng đơn",
      check_in: "2024-08-01",
      check_out: "2024-08-05",
      note: "Yêu cầu phòng gần cửa sổ",
      status: "Chờ xác nhận",
    },
    {
      reservation_id: 2,
      full_name: "Trần Thị H",
      phone: "0912333444",
      email: "guest2@example.com",
      room_type: "Phòng đôi",
      check_in: "2024-08-10",
      check_out: "2024-08-15",
      note: "",
      status: "Đã xác nhận",
    },
    {
      reservation_id: 3,
      full_name: "Lê Văn I",
      phone: "0988777666",
      email: "guest3@example.com",
      room_type: "Phòng gia đình",
      check_in: "2024-09-01",
      check_out: "2024-09-10",
      note: "",
      status: "Đã hủy",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    room_type: "",
    check_in: "",
    check_out: "",
    note: "",
    status: "Chờ xác nhận",
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);

  const columns = [
    { label: "ID", accessor: "reservation_id" },
    { label: "Họ tên", accessor: "full_name" },
    { label: "Số điện thoại", accessor: "phone" },
    { label: "Email", accessor: "email" },
    { label: "Loại phòng", accessor: "room_type" },
    { label: "Nhận phòng", accessor: "check_in" },
    { label: "Trả phòng", accessor: "check_out" },
    { label: "Ghi chú", accessor: "note" },
    { label: "Trạng thái", accessor: "status" },
    {
      label: "Thao tác",
      accessor: "actions",
      render: (_, reservation) => (
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(reservation)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(reservation.reservation_id)}>Xóa</button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setForm({
      full_name: "",
      phone: "",
      email: "",
      room_type: "",
      check_in: "",
      check_out: "",
      note: "",
      status: "Chờ xác nhận",
    });
    setEditingReservation(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (reservation) => {
    setForm({
      full_name: reservation.full_name,
      phone: reservation.phone,
      email: reservation.email,
      room_type: reservation.room_type,
      check_in: reservation.check_in,
      check_out: reservation.check_out,
      note: reservation.note,
      status: reservation.status,
    });
    setEditingReservation(reservation);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (reservationId) => {
    setReservationToDelete(reservationId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    setReservations((prev) => prev.filter((r) => r.reservation_id !== reservationToDelete));
    toast.success("🗑️ Xóa đặt phòng thành công!");
    setShowConfirmDelete(false);
    setReservationToDelete(null);
  };

  const handleSubmitReservation = () => {
    if (editingReservation) {
      // Sửa đặt phòng
      setReservations((prev) =>
        prev.map((r) =>
          r.reservation_id === editingReservation.reservation_id
            ? { ...r, ...form }
            : r
        )
      );
      toast.success("✏️ Cập nhật đặt phòng thành công!");
    } else {
      // Thêm đặt phòng mới
      setReservations((prev) => [
        ...prev,
        {
          ...form,
          reservation_id: prev.length ? Math.max(...prev.map((r) => r.reservation_id)) + 1 : 1,
        },
      ]);
      toast.success("✅ Thêm đặt phòng thành công!");
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
        <h3 className="mb-3">📝 Danh sách đặt phòng trước</h3>
        <button className="btn btn-success mb-3" onClick={handleAdd}>
          ➕ Thêm đặt phòng
        </button>

        <Table columns={columns} data={reservations} />

        {/* Modal Thêm / Sửa */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingReservation ? "✏️ Chỉnh sửa đặt phòng" : "➕ Thêm đặt phòng"}
          showConfirm
          onConfirm={handleSubmitReservation}
        >
          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Họ tên</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.full_name}
                  onChange={(e) => handleFormChange("full_name", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.phone}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Loại phòng</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.room_type}
                  onChange={(e) => handleFormChange("room_type", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Nhận phòng</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.check_in}
                  onChange={(e) => handleFormChange("check_in", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Trả phòng</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.check_out}
                  onChange={(e) => handleFormChange("check_out", e.target.value)}
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
              <div className="col-12">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => handleFormChange("status", e.target.value)}
                  required
                >
                  <option value="Chờ xác nhận">Chờ xác nhận</option>
                  <option value="Đã xác nhận">Đã xác nhận</option>
                  <option value="Đã hủy">Đã hủy</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>

        {/* Modal xác nhận xóa */}
        <ModalConfirm
          isOpen={showConfirmDelete}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa đặt phòng này không?"
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