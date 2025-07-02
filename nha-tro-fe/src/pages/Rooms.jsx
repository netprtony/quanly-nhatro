import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../components/Table.jsx";
import DashboardLayout from "../layouts/DashboardLayout";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);

  const columns = [
    { label: "Mã phòng", accessor: "room_id" },
    { label: "Số phòng", accessor: "room_number" },
    { label: "Tầng", accessor: "floor_number" },
    { label: "Số người tối đa", accessor: "max_occupants" },
    { label: "Còn trống", accessor: "is_available", render: (value) => (value ? "✅ Có" : "❌ Không") },
    { label: "Loại phòng", accessor: "room_type.type_name" }, // Dữ liệu từ quan hệ
    { label: "Giá phòng", accessor: "room_type.price", render: (value) => 
      typeof value === "number" && !isNaN(value)
        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
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
  const handleEdit = (room) => {
    alert(`Chỉnh sửa phòng: ${room.room_number}`);
    // có thể điều hướng sang trang sửa nếu muốn
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
    <div className="container mt-4">
      <h3 className="mb-3">📦 Danh sách phòng</h3>
      <Table columns={columns} data={rooms} onRowClick={handleRowClick} />
    </div>
    </DashboardLayout>
  );
}
