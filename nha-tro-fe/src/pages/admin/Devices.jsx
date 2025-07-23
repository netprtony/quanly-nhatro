import React, { useState } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Devices() {
  // Mock dữ liệu thiết bị
  const [devices, setDevices] = useState([
    {
      device_id: 1,
      device_name: "Máy lạnh",
      room_number: "101",
      status: "Đang hoạt động",
      description: "Máy lạnh Daikin inverter",
    },
    {
      device_id: 2,
      device_name: "Tủ lạnh",
      room_number: "202",
      status: "Bảo trì",
      description: "Tủ lạnh Samsung 200L",
    },
    {
      device_id: 3,
      device_name: "Máy giặt",
      room_number: "303",
      status: "Đang hoạt động",
      description: "Máy giặt LG 8kg",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [form, setForm] = useState({
    device_name: "",
    room_number: "",
    status: "Đang hoạt động",
    description: "",
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);

  const columns = [
    { label: "ID", accessor: "device_id" },
    { label: "Tên thiết bị", accessor: "device_name" },
    { label: "Phòng", accessor: "room_number" },
    { label: "Trạng thái", accessor: "status" },
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

  const handleAdd = () => {
    setForm({
      device_name: "",
      room_number: "",
      status: "Đang hoạt động",
      description: "",
    });
    setEditingDevice(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (device) => {
    setForm({
      device_name: device.device_name,
      room_number: device.room_number,
      status: device.status,
      description: device.description,
    });
    setEditingDevice(device);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (deviceId) => {
    setDeviceToDelete(deviceId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    setDevices((prev) => prev.filter((d) => d.device_id !== deviceToDelete));
    toast.success("🗑️ Xóa thiết bị thành công!");
    setShowConfirmDelete(false);
    setDeviceToDelete(null);
  };

  const handleSubmitDevice = () => {
    if (editingDevice) {
      // Sửa thiết bị
      setDevices((prev) =>
        prev.map((d) =>
          d.device_id === editingDevice.device_id
            ? { ...d, ...form }
            : d
        )
      );
      toast.success("✏️ Cập nhật thiết bị thành công!");
    } else {
      // Thêm thiết bị mới
      setDevices((prev) => [
        ...prev,
        {
          ...form,
          device_id: prev.length ? Math.max(...prev.map((d) => d.device_id)) + 1 : 1,
        },
      ]);
      toast.success("✅ Thêm thiết bị thành công!");
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
        <h3 className="mb-3">🔌 Danh sách thiết bị</h3>
        <button className="btn btn-success mb-3" onClick={handleAdd}>
          ➕ Thêm thiết bị
        </button>

        <Table columns={columns} data={devices} />

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
                <input
                  type="text"
                  className="form-control"
                  value={form.room_number}
                  onChange={(e) => handleFormChange("room_number", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => handleFormChange("status", e.target.value)}
                  required
                >
                  <option value="Đang hoạt động">Đang hoạt động</option>
                  <option value="Bảo trì">Bảo trì</option>
                  <option value="Hỏng">Hỏng</option>
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