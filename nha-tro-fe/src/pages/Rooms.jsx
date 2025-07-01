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
    { label: "Còn trống", accessor: "is_available" },
  ];

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
