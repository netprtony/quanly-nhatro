import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Table from "/src/components/Table.jsx";
import AdvancedFilters from "/src/components/AdvancedFilters.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ROOMS_API = "http://localhost:8000/rooms/all";
const WATER_API = "http://localhost:8000/water";

export default function Waters() {
  const [waters, setWaters] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWater, setEditingWater] = useState(null);
  const [form, setForm] = useState({
    room_id: "",
    month: "",
    old_reading: "",
    new_reading: "",
    water_rate: 15000,
    note: "",
  });
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [waterToDelete, setWaterToDelete] = useState(null);

  // Phân trang, lọc, sort
  const [filters, setFilters] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const fieldOptions = [
    { value: "room_id", label: "Phòng", type: "number" },
    { value: "month", label: "Tháng", type: "string" },
    { value: "old_reading", label: "Chỉ số cũ", type: "number" },
    { value: "new_reading", label: "Chỉ số mới", type: "number" },
    { value: "water_rate", label: "Đơn giá", type: "number" },
  ];

  const columns = [
    { label: "ID", accessor: "meter_id" },
    {
      label: "Phòng",
      accessor: "room_id",
      render: (room_id) => {
        const room = rooms.find((r) => r.room_id === room_id);
        return room ? room.room_number : room_id;
      },
    },
    { label: "Tháng", accessor: "month" },
    { label: "Chỉ số cũ", accessor: "old_reading" },
    { label: "Chỉ số mới", accessor: "new_reading" },
    {
      label: "Số m³",
      accessor: "usage_m3",
      render: (_, row) => row.new_reading - row.old_reading,
    },
    {
      label: "Thành tiền",
      accessor: "total_amount",
      render: (value) =>
        typeof value === "number"
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value)
          : "N/A",
    },
    {
      label: "Đơn giá (m³)",
      accessor: "water_rate",
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
      render: (_, water) => (
        <div className="d-flex gap-2 justify-content-center">
          <button
            className="btn btn-sm btn-warning"
            onClick={() => handleEdit(water)}
          >
            Sửa
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(water.meter_id)}
          >
            Xóa
          </button>
        </div>
      ),
    },
  ];

  // Lấy danh sách phòng
  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${ROOMS_API}?filter_is_available=false`);
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch {
      setRooms([]);
    }
  };

  // Lấy danh sách hóa đơn nước có phân trang
  const fetchWaters = async () => {
    try {
      let sortParams = "";
      if (sortField) sortParams += `&sort_field=${sortField}`;
      if (sortOrder) sortParams += `&sort_order=${sortOrder}`;
      let data;
      if (filters.length > 0) {
        const res = await axios.post(
          `${WATER_API}/filter?page=${page}&page_size=${pageSize}${sortParams}`,
          { filters }
        );
        data = res.data;
      } else {
        const res = await axios.get(
          `${WATER_API}?page=${page}&page_size=${pageSize}${sortParams}`
        );
        data = res.data;
      }
      setWaters(Array.isArray(data.items) ? data.items : []);
      setTotalRecords(data.total || 0);
    } catch {
      setWaters([]);
      setTotalRecords(0);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchWaters();
    // eslint-disable-next-line
  }, [filters, page, pageSize, sortField, sortOrder]);

  const handleAdd = () => {
    setForm({
      room_id: "",
      month: "",
      old_reading: "",
      new_reading: "",
      water_rate: 15000,
      note: "",
    });
    setEditingWater(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (water) => {
    // Chuyển water.month (YYYY-MM-DD) về YYYY-MM cho input type="month"
    let monthValue = "";
    if (water.month) {
      // Nếu là dạng "2025-08-01" thì lấy "2025-08"
      monthValue = water.month.slice(0, 7);
    }
    setForm({
      room_id: water.room_id ? String(water.room_id) : "",
      month: monthValue,
      old_reading: water.old_reading,
      new_reading: water.new_reading,
      water_rate: water.water_rate,
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

  const confirmDelete = async () => {
    try {
      await axios.delete(`${WATER_API}/${waterToDelete}`);
      toast.success("🗑️ Xóa hóa đơn nước thành công!");
      fetchWaters();
    } catch {
      toast.error("❌ Lỗi xóa hóa đơn nước!");
    } finally {
      setShowConfirmDelete(false);
      setWaterToDelete(null);
    }
  };

  const handleSubmitWater = async () => {
    if (parseInt(form.old_reading) > parseInt(form.new_reading)) {
      toast.error("❌ Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ!");
      return;
    }
    const payload = {
      ...form,
      room_id: form.room_id ? parseInt(form.room_id) : null,
      old_reading: form.old_reading ? parseInt(form.old_reading) : 0,
      new_reading: form.new_reading ? parseInt(form.new_reading) : 0,
      water_rate: form.water_rate ? parseFloat(form.water_rate) : 15000,
      month: form.month ? form.month + "-01" : "",
    };
    try {
      if (editingWater) {
        await axios.put(`${WATER_API}/${editingWater.meter_id}`, payload);
        toast.success("✏️ Cập nhật hóa đơn nước thành công!");
      } else {
        await axios.post(WATER_API, payload);
        toast.success("✅ Thêm hóa đơn nước thành công!");
      }
      setShowModal(false);
      fetchWaters();
    } catch {
      toast.error("❌ Lỗi khi lưu hóa đơn nước!");
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
    <div className="container mt-4 position-relative">
      <div className="p-4 rounded shadow bg-white">
        <h3 className="mb-3">🚰 Quản lý nước</h3>
        <button className="btn btn-success mb-3" onClick={handleAdd}>
          ➕ Thêm hóa đơn nước
        </button>

        {/* Bộ lọc nâng cao */}
        <div className="mb-3">
          <AdvancedFilters
            fieldOptions={fieldOptions}
            filters={filters}
            onAddFilter={(f) => setFilters((prev) => [...prev, f])}
            onRemoveFilter={(i) => setFilters((prev) => prev.filter((_, idx) => idx !== i))}
            compact
          />
        </div>

        <Table
          columns={columns}
          data={waters}
          page={page}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={(field, order) => {
            setSortField(field);
            setSortOrder(order);
          }}
        />

        {/* Modal Thêm / Sửa */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={
            editingWater
              ? "✏️ Chỉnh sửa hóa đơn nước"
              : "➕ Thêm hóa đơn nước"
          }
          showConfirm
          onConfirm={handleSubmitWater}
        >
          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Phòng</label>
                <select
                  className="form-select"
                  value={form.room_id}
                  onChange={(e) => handleFormChange("room_id", e.target.value)}
                  required
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map((room) => (
                    <option key={room.room_id} value={room.room_id}>
                      {room.room_number}
                    </option>
                  ))}
                </select>
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
                  value={form.old_reading}
                  onChange={(e) => handleFormChange("old_reading", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Chỉ số mới</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.new_reading}
                  onChange={(e) => handleFormChange("new_reading", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Đơn giá (VND/m³)</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.water_rate}
                  onChange={(e) => handleFormChange("water_rate", e.target.value)}
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

        <ModalConfirm
          isOpen={showConfirmDelete}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa hóa đơn nước này không?"
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={confirmDelete}
          onClose={() => setShowConfirmDelete(false)}
        />

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