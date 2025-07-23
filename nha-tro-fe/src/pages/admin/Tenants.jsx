import React, { useState } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Tenants() {
  // Mock dữ liệu khách thuê
  const [tenants, setTenants] = useState([
    {
      tenant_id: 1,
      full_name: "Nguyễn Văn D",
      phone: "0901234567",
      email: "tenant1@example.com",
      id_number: "123456789",
      address: "Hà Nội",
      is_active: true,
    },
    {
      tenant_id: 2,
      full_name: "Trần Thị E",
      phone: "0912345678",
      email: "tenant2@example.com",
      id_number: "987654321",
      address: "Hồ Chí Minh",
      is_active: true,
    },
    {
      tenant_id: 3,
      full_name: "Lê Văn F",
      phone: "0987654321",
      email: "tenant3@example.com",
      id_number: "456789123",
      address: "Đà Nẵng",
      is_active: false,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    id_number: "",
    address: "",
    is_active: true,
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);

  const columns = [
    { label: "ID", accessor: "tenant_id" },
    { label: "Họ tên", accessor: "full_name" },
    { label: "Số điện thoại", accessor: "phone" },
    { label: "Email", accessor: "email" },
    { label: "CMND/CCCD", accessor: "id_number" },
    { label: "Địa chỉ", accessor: "address" },
    {
      label: "Trạng thái",
      accessor: "is_active",
      render: (value) => (value ? "✅ Đang thuê" : "❌ Đã rời"),
    },
    {
      label: "Thao tác",
      accessor: "actions",
      render: (_, tenant) => (
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(tenant)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(tenant.tenant_id)}>Xóa</button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setForm({
      full_name: "",
      phone: "",
      email: "",
      id_number: "",
      address: "",
      is_active: true,
    });
    setEditingTenant(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (tenant) => {
    setForm({
      full_name: tenant.full_name,
      phone: tenant.phone,
      email: tenant.email,
      id_number: tenant.id_number,
      address: tenant.address,
      is_active: tenant.is_active,
    });
    setEditingTenant(tenant);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (tenantId) => {
    setTenantToDelete(tenantId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    setTenants((prev) => prev.filter((t) => t.tenant_id !== tenantToDelete));
    toast.success("🗑️ Xóa khách thuê thành công!");
    setShowConfirmDelete(false);
    setTenantToDelete(null);
  };

  const handleSubmitTenant = () => {
    if (editingTenant) {
      // Sửa khách thuê
      setTenants((prev) =>
        prev.map((t) =>
          t.tenant_id === editingTenant.tenant_id
            ? { ...t, ...form }
            : t
        )
      );
      toast.success("✏️ Cập nhật khách thuê thành công!");
    } else {
      // Thêm khách thuê mới
      setTenants((prev) => [
        ...prev,
        {
          ...form,
          tenant_id: prev.length ? Math.max(...prev.map((t) => t.tenant_id)) + 1 : 1,
        },
      ]);
      toast.success("✅ Thêm khách thuê thành công!");
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
        <h3 className="mb-3">🧑‍💼 Danh sách khách thuê</h3>
        <button className="btn btn-success mb-3" onClick={handleAdd}>
          ➕ Thêm khách thuê
        </button>

        <Table columns={columns} data={tenants} />

        {/* Modal Thêm / Sửa */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingTenant ? "✏️ Chỉnh sửa khách thuê" : "➕ Thêm khách thuê"}
          showConfirm
          onConfirm={handleSubmitTenant}
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
                <label className="form-label">CMND/CCCD</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.id_number}
                  onChange={(e) => handleFormChange("id_number", e.target.value)}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Địa chỉ</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                />
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isActive"
                    checked={form.is_active}
                    onChange={(e) => handleFormChange("is_active", e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="isActive">
                    Đang thuê
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
          message="Bạn có chắc chắn muốn xóa khách thuê này không?"
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