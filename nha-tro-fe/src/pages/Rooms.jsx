import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../components/Table.jsx";
import DashboardLayout from "../layouts/DashboardLayout";
import Modal from "../components/Modal.jsx";
import ModalConfirm from "../components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState({
    room_number: "",
    floor_number: "",
    max_occupants: "",
    room_type_id: "",
    is_available: true,
    description: "",
  });

  const [roomTypes, setRoomTypes] = useState([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  const columns = [
    { label: "Mã phòng", accessor: "room_id" },
    { label: "Số phòng", accessor: "room_number" },
    { label: "Tầng", accessor: "floor_number" },
    { label: "Số người tối đa", accessor: "max_occupants" },
    {
      label: "Còn trống",
      accessor: "is_available",
      render: (value) => (value ? "✅ Có" : "❌ Không"),
    },
    { label: "Loại phòng", accessor: "room_type.type_name" },
    {
      label: "Giá phòng",
      accessor: "room_type.price_per_month",
      render: (value) =>
        typeof value === "number"
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value)
          : "N/A",
    },
    {
      label: "Thao tác",
      accessor: "actions",
      render: (_, room) => (
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(room)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(room.room_id)}>Xóa</button>
        </div>
      ),
    },
  ];

  const fetchRooms = async () => {
    try {
      const res = await axios.get("http://localhost:8000/rooms");
      setRooms(res.data);
    } catch (err) {
      toast.error("❌ Lỗi khi lấy danh sách phòng!");
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/roomtypes`);
      setRoomTypes(res.data);
    } catch (err) {
      toast.error("❌ Lỗi khi lấy loại phòng!");
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
  }, []);

  const handleAdd = () => {
    setForm({
      room_number: "",
      floor_number: "",
      max_occupants: "",
      room_type_id: "",
      is_available: true,
      description: "",
    });
    setEditingRoom(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (room) => {
    setForm({
      room_number: room.room_number,
      floor_number: room.floor_number,
      max_occupants: room.max_occupants,
      room_type_id: room.room_type.room_type_id,
      is_available: room.is_available,
      description: room.description || "",
    });
    setEditingRoom(room);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (roomId) => {
    setRoomToDelete(roomId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/rooms/${roomToDelete}`);
      toast.success("🗑️ Xóa phòng thành công!");
      fetchRooms();
    } catch (err) {
      toast.error("❌ Lỗi xóa phòng!");
    } finally {
      setShowConfirmDelete(false);
      setRoomToDelete(null);
    }
  };

  const handleSubmitRoom = async () => {
    try {
      if (editingRoom) {
        await axios.put(`http://localhost:8000/rooms/${editingRoom.room_id}`, form);
        toast.success("✏️ Cập nhật phòng thành công!");
      } else {
        await axios.post("http://localhost:8000/rooms", form);
        toast.success("✅ Thêm phòng thành công!");
      }
      setShowModal(false);
      fetchRooms();
    } catch (err) {
      toast.error("❌ Lỗi khi lưu phòng!");
    }
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
    <DashboardLayout>
      <div className="container mt-4 position-relative">
        <div className="p-4 rounded shadow bg-white">
          <h3 className="mb-3">📦 Danh sách phòng</h3>
          <button className="btn btn-success mb-3" onClick={handleAdd}>
            ➕ Thêm phòng
          </button>

          <Table columns={columns} data={rooms} />

          {/* Modal Thêm / Sửa */}
          <Modal
            isOpen={showModal}
            onClose={handleCloseModal}
            title={editingRoom ? "✏️ Chỉnh sửa phòng" : "➕ Thêm phòng"}
            showConfirm
            onConfirm={handleSubmitRoom}
          >
            <form>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Số phòng</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.room_number}
                    onChange={(e) => handleFormChange("room_number", e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Tầng</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.floor_number}
                    onChange={(e) => handleFormChange("floor_number", parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Số người tối đa</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.max_occupants}
                    onChange={(e) => handleFormChange("max_occupants", parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Loại phòng</label>
                  <select
                    className="form-select"
                    value={form.room_type_id}
                    onChange={(e) => handleFormChange("room_type_id", parseInt(e.target.value))}
                    required
                  >
                    <option value="">-- Chọn loại phòng --</option>
                    {roomTypes.map((type) => (
                      <option key={type.room_type_id} value={type.room_type_id}>
                        {type.type_name}
                      </option>
                    ))}
                  </select>
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

                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isAvailable"
                      checked={form.is_available}
                      onChange={(e) => handleFormChange("is_available", e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="isAvailable">
                      Còn trống
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </Modal>

          {/* Modal xác nhận xóa */}
          <ModalConfirm
            isOpen={showConfirmDelete}
            title="Xác nhận xóa"
            message="Bạn có chắc chắn muốn xóa phòng này không?"
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
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </DashboardLayout>
  );
}