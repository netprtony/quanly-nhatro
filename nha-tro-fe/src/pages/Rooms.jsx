import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../components/Table.jsx";
import DashboardLayout from "../layouts/DashboardLayout";
import Modal from "../components/Modal";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null); // null: đang thêm
  const [form, setForm] = useState({
    room_number: "",
    floor_number: "",
    max_occupants: "",
    room_type_id: "",
    is_available: true,
    description: "",
  });
  const columns = [
    { label: "Mã phòng", accessor: "room_id" },
    { label: "Số phòng", accessor: "room_number" },
    { label: "Tầng", accessor: "floor_number" },
    { label: "Số người tối đa", accessor: "max_occupants" },
    { label: "Còn trống", accessor: "is_available", render: (value) => (value ? "✅ Có" : "❌ Không") },
    { label: "Loại phòng", accessor: "room_type.type_name" }, // Dữ liệu từ quan hệ
    { label: "Giá phòng", 
      accessor: "room_type.price_per_month",
      render: (value) =>
        typeof value === "number" && !isNaN(value)
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value)
          : "N/A"
    },
    { label: "Thao tác", accessor: "actions", render: (_, room) => (
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(room)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(room.room_id)}>Xóa</button>
        </div>
      )
    },
  ];
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
  setShowModal(true);
};
const handleSubmitRoom = async () => {
  try {
    if (editingRoom) {
      await axios.put(`http://localhost:8000/rooms/${editingRoom.room_id}`, form);
    } else {
      console.log("Form data gửi đi:", form);
      await axios.post("http://localhost:8000/rooms", form);
    }
    setShowModal(false);
    fetchRooms();
  } catch (err) {
    alert("Lỗi khi lưu phòng");
  }
};
  const handleDelete = async (roomId) => {
    if (confirm("Bạn có chắc chắn muốn xóa phòng này không?")) {
      try {
        await axios.delete(`http://localhost:8000/rooms/${roomId}`);
        fetchRooms(); // refresh danh sách
      } catch (err) {
        alert("Lỗi xóa phòng");
      }
    }
};
  const fetchRooms = async () => {
    try {
      const res = await axios.get("http://localhost:8000/rooms");
      setRooms(res.data);
    } catch (err) {
      alert("Lỗi lấy danh sách phòng");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleRowClick = (room) => {
    alert(`Chọn phòng: ${room.room_number}`);
  };

  return (
    <DashboardLayout>
     {/* Nền toàn màn hình */}
  <div
    className="top-0 start-0 w-100 h-100"
  />

  {/* Nội dung chính */}
  <div className="container mt-4 position-relative">
    <div
      className="p-4 rounded shadow"
    >
      <h3 className="mb-3">📦 Danh sách phòng</h3>
      <button className="btn btn-success mb-3" onClick={handleAdd}>
        ➕ Thêm phòng
      </button>
      <Table columns={columns} data={rooms} onRowClick={handleRowClick} />
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
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
                onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Tầng</label>
              <input
                type="number"
                className="form-control"
                value={form.floor_number}
                onChange={(e) => setForm({ ...form, floor_number: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Số người tối đa</label>
              <input
                type="number"
                className="form-control"
                value={form.max_occupants}
                onChange={(e) => setForm({ ...form, max_occupants: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Mã loại phòng (room_type_id)</label>
              <input
                type="number"
                className="form-control"
                value={form.room_type_id}
                onChange={(e) => setForm({ ...form, room_type_id: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Mô tả</label>
              <textarea
                className="form-control"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="isAvailable">
                  Còn trống
                </label>
              </div>
            </div>
          </div>
        </form>

      </Modal>

    </div>
  </div>
    </DashboardLayout>
  );
}
