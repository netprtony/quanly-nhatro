import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from "/src/components/Table.jsx";
import AdvancedFilters from "/src/components/AdvancedFilters.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ROOMS_API = "http://localhost:8000/rooms";
const ELECTRICITY_API = "http://localhost:8000/electricity";

export default function Electricity() {
  const [electricities, setElectricities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingElectricity, setEditingElectricity] = useState(null);
  const [form, setForm] = useState({
    room_id: "",
    month: "",
    old_reading: "",
    new_reading: "",
    electricity_rate: 3500,
    note: "",
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [electricityToDelete, setElectricityToDelete] = useState(null);

  // Advanced filters state
  const [filters, setFilters] = useState([]);
  const [newFilter, setNewFilter] = useState({ field: "room_id", operator: "=", value: "" });

  const fieldOptions = [
    { value: "room_id", label: "Phòng", type: "number" },
    { value: "month", label: "Tháng", type: "string" },
    { value: "old_reading", label: "Chỉ số cũ", type: "number" },
    { value: "new_reading", label: "Chỉ số mới", type: "number" },
    { value: "electricity_rate", label: "Đơn giá", type: "number" },
  ];

  const columns = [
    { label: "ID", accessor: "meter_id" },
    {
      label: "Phòng",
      accessor: "room_id",
      render: (room_id) => {
        const room = rooms.find(r => r.room_id === room_id);
        return room ? room.room_number : room_id;
      }
    },
    { label: "Tháng", accessor: "month" },
    { label: "Chỉ số cũ", accessor: "old_reading" },
    { label: "Chỉ số mới", accessor: "new_reading" },
    {
      label: "Số kWh",
      accessor: "usage_kwh",
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
      label: "Đơn giá (kWh)",
      accessor: "electricity_rate",
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
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(electricity.meter_id)}>Xóa</button>
        </div>
      ),
    },
  ];

  const fetchRooms = async () => {
    try {
      const res = await axios.get(ROOMS_API);
      setRooms(res.data);
    } catch (err) {
      toast.error("❌ Lỗi khi lấy danh sách phòng!");
    }
  };

  const fetchElectricities = async () => {
    try {
      const res = await axios.get(ELECTRICITY_API);
      setElectricities(res.data);
    } catch (err) {
      toast.error("❌ Lỗi khi lấy danh sách hóa đơn điện!");
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchElectricities();
  }, []);

  const handleAdd = () => {
    setForm({
      room_id: "",
      month: "",
      old_reading: "",
      new_reading: "",
      electricity_rate: 3500,
      note: "",
    });
    setEditingElectricity(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (electricity) => {
    setForm({
      room_id: electricity.room_id ? String(electricity.room_id) : "",
      month: electricity.month,
      old_reading: electricity.old_reading,
      new_reading: electricity.new_reading,
      electricity_rate: electricity.electricity_rate,
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

  const confirmDelete = async () => {
    try {
      await axios.delete(`${ELECTRICITY_API}/${electricityToDelete}`);
      toast.success("🗑️ Xóa hóa đơn điện thành công!");
      fetchElectricities();
    } catch (err) {
      toast.error("❌ Lỗi xóa hóa đơn điện!");
    } finally {
      setShowConfirmDelete(false);
      setElectricityToDelete(null);
    }
  };

  const handleSubmitElectricity = async () => {
    const payload = {
      ...form,
      room_id: form.room_id ? parseInt(form.room_id) : null,
      old_reading: form.old_reading ? parseInt(form.old_reading) : 0,
      new_reading: form.new_reading ? parseInt(form.new_reading) : 0,
      electricity_rate: form.electricity_rate ? parseInt(form.electricity_rate) : 3500,
    };
    try {
      if (editingElectricity) {
        await axios.put(`${ELECTRICITY_API}/${editingElectricity.meter_id}`, payload);
        toast.success("✏️ Cập nhật hóa đơn điện thành công!");
      } else {
        await axios.post(ELECTRICITY_API, payload);
        toast.success("✅ Thêm hóa đơn điện thành công!");
      }
      setShowModal(false);
      fetchElectricities();
    } catch (err) {
      toast.error("❌ Lỗi khi lưu hóa đơn điện!");
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

  // Advanced filter logic (same as Rooms)
  const getValueByPath = (obj, path) => {
    return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj);
  };

  const evaluateFilter = (f, item) => {
    const raw = getValueByPath(item, f.field);
    if (raw === undefined || raw === null) return false;

    const maybeNum = Number(raw);
    const targetNum = Number(f.value);
    const isNumeric = !isNaN(maybeNum) && !isNaN(targetNum);

    if (isNumeric) {
      switch (f.operator) {
        case '>': return maybeNum > targetNum;
        case '<': return maybeNum < targetNum;
        case '>=': return maybeNum >= targetNum;
        case '<=': return maybeNum <= targetNum;
        case '=': return maybeNum === targetNum;
        case '~':
          const diff = Math.abs(maybeNum - targetNum);
          const tol = Math.max(1, Math.abs(targetNum) * 0.1);
          return diff <= tol;
        default: return false;
      }
    }

    // string operations
    const rawStr = String(raw).toLowerCase();
    const valStr = String(f.value).toLowerCase();
    if (f.operator === '=') return rawStr === valStr;
    if (f.operator === '~') return rawStr.includes(valStr);
    return false;
  };

  const applyFilters = (list) => {
    if (!filters || filters.length === 0) return list;
    return list.filter((item) => filters.every((f) => evaluateFilter(f, item)));
  };

  const filteredElectricities = applyFilters(electricities);

  return (
    <div className="container mt-4 position-relative">
      <div className="p-4 rounded shadow bg-white">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="mb-0">⚡ Quản lý điện</h3>
          <button className="btn btn-success" onClick={handleAdd}>
            ➕ Thêm hóa đơn điện
          </button>
        </div>

        <div className="mb-3">
          <AdvancedFilters
            fieldOptions={fieldOptions}
            filters={filters}
            onAddFilter={(f) => setFilters((prev) => [...prev, f])}
            onRemoveFilter={(i) => setFilters((prev) => prev.filter((_, idx) => idx !== i))}
            compact
          />
        </div>

        <Table columns={columns} data={filteredElectricities} />

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
                <select
                  className="form-select"
                  value={form.room_id}
                  onChange={(e) => handleFormChange("room_id", e.target.value)}
                  required
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map(room => (
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
                <label className="form-label">Đơn giá (VND/kWh)</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.electricity_rate}
                  onChange={(e) => handleFormChange("electricity_rate", e.target.value)}
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
          message="Bạn có chắc chắn muốn xóa hóa đơn điện này không?"
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