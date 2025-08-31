import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "/src/components/Table.jsx";
import AdvancedFilters from "/src/components/AdvancedFilters.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DEVICES_API = "http://localhost:8000/devices/";
const ROOMS_API = "http://localhost:8000/rooms/";

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
  const [sortField, setSortField] = useState();
  const [sortOrder, setSortOrder] = useState();
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [filters, setFilters] = useState([]);
  const [search, setSearch] = useState("");

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
      render: (is_active) => {
        let badgeClass = is_active ? "bg-success" : "bg-secondary";
        return <span className={`badge ${badgeClass}`}>{is_active ? "Đang hoạt động (1)" : "Hư hỏng (0)"}</span>;
      }
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

  const fetchDevices = async (field = sortField, order = sortOrder) => {
    try {
      let url = `${DEVICES_API}?page=${page}&page_size=${pageSize}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (field) url += `&sort_field=${field}`;
      if (order) url += `&sort_order=${order}`;
      let res, data;
      if (filters.length > 0) {
        res = await fetch(url.replace(DEVICES_API, DEVICES_API + "filter"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters, sort_field: field, sort_order: order }),
        });
      } else {
        res = await fetch(url);
      }
      data = await res.json();
      setDevices(Array.isArray(data.items) ? data.items : []);
      setTotalRecords(data.total || 0);
    } catch (err) {
      toast.error("Không thể tải danh sách thiết bị!");
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
    // eslint-disable-next-line
  }, [filters, page, pageSize, search, sortField, sortOrder]);
  const exportCSV = () => {
    if (contracts.length === 0) return;
    const headers = Object.keys(contracts[0]);
    const csv = [
      headers.join(","),
      ...contracts.map((row) =>
        headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contracts.csv";
    a.click();
  };

  // Export JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(contracts, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contracts.json";
    a.click();
  };
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
      await axios.delete(`${DEVICES_API}${deviceToDelete}`);
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
        await axios.put(`${DEVICES_API}${editingDevice.device_id}`, payload);
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
            onLoad={fetchDevices}
            onSearch={setSearch}
            onExportCSV={exportCSV}
            onExportJSON={exportJSON}
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
          }}
          onSort={(field, order) => {
            setSortField(field);
            setSortOrder(order);
            fetchDevices(field, order);
          }}
          sortField={sortField}
          sortOrder={sortOrder}
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
                  <option value="false">Hư hỏng</option>
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

      {/* Toast thông báo */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick draggable pauseOnHover />
    </div>
  );
}