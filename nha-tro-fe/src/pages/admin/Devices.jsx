import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "/src/components/Table.jsx";
import AdvancedFilters from "/src/components/AdvancedFilters.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DEVICES_API = "http://localhost:8000/devices";
const ROOMS_API = "http://localhost:8000/rooms";

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [form, setForm] = useState({
    device_name: "",
    room_id: "",
    description: "",
    is_active: true,
  });
    // Phân trang
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [filters, setFilters] = useState([]);
  const [newFilter, setNewFilter] = useState({ field: "device_name", operator: "~", value: "" });

  const fieldOptions = [
    { value: "device_name", label: "Tên thiết bị", type: "string" },
    { value: "room_id", label: "Phòng", type: "number" },
    { value: "is_active", label: "Trạng thái hoạt động", type: "boolean" },
    { value: "description", label: "Mô tả", type: "string" },
  ];

  const columns = [
    { label: "ID", accessor: "device_id" },
    { label: "Tên thiết bị", accessor: "device_name" },
    {
      label: "Phòng",
      accessor: "room_id",
      render: (room_id) => {
        const room = rooms.find((r) => r.room_id === room_id);
        return room ? room.room_number : room_id;
      },
    },
    {
      label: "Trạng thái",
      accessor: "is_active",
      render: (is_active) => (is_active ? "Đang hoạt động" : "Không hoạt động"),
    },
    { label: "Mô tả", accessor: "description" },
    {
      label: "Thao tác",
      accessor: "actions",
      render: (_, device) => (
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(device)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(device.device_id)}>Xóa</button>
        </div>
      ),
    },
  ];

  const fetchDevices = async () => {
    try {
      let query = `?page=${page}&page_size=${pageSize}`;
      if (filters.length > 0) {
        query += "&" + filters
          .map(
            (f) =>
              `filter_${f.field}=${encodeURIComponent(
                f.operator + f.value
              )}`
          )
          .join("&");
      }
       const res = await fetch(DEVICES_API + query);
        const data = await res.json();
        setDevices(Array.isArray(data.items) ? data.items : []);
        setTotalRecords(data.total || 0);
    } catch (err) {
      toast.error("❌ Lỗi khi lấy danh sách thiết bị!");
      setDevices([]);
      setTotalRecords(0);
    }
  };

  const fetchRooms = async () => {
      try {
        // có phân trang, mặc định lấy 1 trang lớn để đủ dữ liệu
        const res = await fetch(`${ROOMS_API}?page=1&page_size=200`);
        const data = await res.json();
        setRooms(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        toast.error("Không thể tải danh sách phòng!");
        setRooms([]);
      }
    };

  useEffect(() => {
    fetchDevices();
    fetchRooms();
  }, [filters, page, pageSize]);

  const handleAdd = () => {
    setForm({
      device_name: "",
      room_id: "",
      description: "",
      is_active: true,
    });
    setEditingDevice(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (device) => {
    setForm({
      device_name: device.device_name,
      room_id: device.room_id ? String(device.room_id) : "",
      description: device.description || "",
      is_active: device.is_active,
    });
    setEditingDevice(device);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (deviceId) => {
    setDeviceToDelete(deviceId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${DEVICES_API}/${deviceToDelete}`);
      toast.success("🗑️ Xóa thiết bị thành công!");
      fetchDevices();
    } catch (err) {
      toast.error("❌ Lỗi xóa thiết bị!");
    } finally {
      setShowConfirmDelete(false);
      setDeviceToDelete(null);
    }
  };

  const handleSubmitDevice = async () => {
    try {
      const payload = {
        ...form,
        room_id: form.room_id ? parseInt(form.room_id) : null,
        is_active: form.is_active,
      };
      if (editingDevice) {
        await axios.put(`${DEVICES_API}/${editingDevice.device_id}`, payload);
        toast.success("✏️ Cập nhật thiết bị thành công!");
      } else {
        await axios.post(DEVICES_API, payload);
        toast.success("✅ Thêm thiết bị thành công!");
      }
      setShowModal(false);
      fetchDevices();
    } catch (err) {
      toast.error("❌ Lỗi khi lưu thiết bị!");
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

  const addFilter = () => {
    if (!newFilter.field || newFilter.value === "") {
      toast.warn("Vui lòng chọn trường và nhập giá trị lọc");
      return;
    }
    setFilters((prev) => [...prev, { ...newFilter }]);
    setNewFilter((prev) => ({ ...prev, value: "" }));
  };

  const removeFilter = (index) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  };

  const getValueByPath = (obj, path) => {
    return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj);
  };

  const evaluateFilter = (f, device) => {
    const raw = getValueByPath(device, f.field);
    if (raw === undefined || raw === null) return false;

    // normalize boolean field input
    if (f.field === 'is_active') {
      const target = f.value === 'true' || f.value === true || f.value === '1';
      if (f.operator === '=') return raw === target;
      if (f.operator === '!=') return raw !== target;
      return false;
    }

    // numeric comparison when possible
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

  const filteredDevices = applyFilters(devices);

  return (
    <div className="container mt-4 position-relative">
      <div className="p-4 rounded shadow bg-white">
        {/* Header: Tiêu đề và nút Thêm thiết bị ở góc phải */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="mb-0">🔌 Danh sách thiết bị</h3>
          <button className="btn btn-success" onClick={handleAdd}>
            ➕ Thêm thiết bị
          </button>
        </div>

        {/* Bộ lọc nâng cao nằm ngang, nút thêm bộ lọc cùng hàng với các trường */}
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
            data={devices}
            page={page}
            pageSize={pageSize}
            totalRecords={totalRecords}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
              fetchRooms();
              }}
            />

        {/* Modal Thêm / Sửa */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingDevice ? "✏️ Chỉnh sửa thiết bị" : "➕ Thêm thiết bị"}
          showConfirm
          onConfirm={handleSubmitDevice}
        >
          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Tên thiết bị</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.device_name}
                  onChange={(e) => handleFormChange("device_name", e.target.value)}
                  required
                />
              </div>
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
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  value={form.is_active ? "true" : "false"}
                  onChange={(e) => handleFormChange("is_active", e.target.value === "true")}
                  required
                >
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Mô tả</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                />
              </div>
            </div>
          </form>
        </Modal>

        {/* Modal xác nhận xóa */}
        <ModalConfirm
          isOpen={showConfirmDelete}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa thiết bị này không?"
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirmDelete(false)}
        />
      </div>

      {/* Toast thông báo */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick draggable pauseOnHover />
    </div>
  );
}