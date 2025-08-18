import React, { useState, useEffect } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:8000/tenants";

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [form, setForm] = useState({
    tenant_id: "",
    full_name: "",
    phone_number: "",
    email: "",
    address: "",
    gender: "Other",
    date_of_birth: "",
    id_card_front_path: "",
    id_card_back_path: "",
    is_active: true,
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);

  // Lấy danh sách tenants từ API
  const fetchTenants = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTenants(data);
    } catch (err) {
      toast.error("Không thể tải danh sách khách thuê!");
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // Thêm mới tenant
  const createTenant = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchTenants();
      toast.success("✅ Thêm khách thuê thành công!");
      setShowModal(false);
    } catch (err) {
      toast.error("Thêm khách thuê thất bại! " + err.message);
    }
  };

  // Sửa tenant
  const updateTenant = async () => {
    try {
      const res = await fetch(`${API_URL}/${editingTenant.tenant_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchTenants();
      toast.success("✏️ Cập nhật khách thuê thành công!");
      setShowModal(false);
    } catch (err) {
      toast.error("Cập nhật khách thuê thất bại! " + err.message);
    }
  };

  // Xóa tenant
  const deleteTenant = async () => {
    try {
      const res = await fetch(`${API_URL}/${tenantToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchTenants();
      toast.success("🗑️ Xóa khách thuê thành công!");
      setShowConfirmDelete(false);
      setTenantToDelete(null);
    } catch (err) {
      toast.error("Xóa khách thuê thất bại! " + err.message);
    }
  };

  const columns = [
    { label: "ID", accessor: "tenant_id" },
    { label: "Họ tên", accessor: "full_name" },
    { label: "Số điện thoại", accessor: "phone_number" },
    { label: "Email", accessor: "email" },
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
      tenant_id: "",
      full_name: "",
      phone_number: "",
      email: "",
      address: "",
      gender: "Other",
      date_of_birth: "",
      id_card_front_path: "",
      id_card_back_path: "",
      is_active: true,
    });
    setEditingTenant(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (tenant) => {
    setForm({
      tenant_id: tenant.tenant_id,
      full_name: tenant.full_name,
      phone_number: tenant.phone_number || "",
      email: tenant.email || "",
      address: tenant.address || "",
      gender: tenant.gender || "Other",
      date_of_birth: tenant.date_of_birth || "",
      id_card_front_path: tenant.id_card_front_path || "",
      id_card_back_path: tenant.id_card_back_path || "",
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
    deleteTenant();
  };

  const handleSubmitTenant = () => {
    if (editingTenant) {
      updateTenant();
    } else {
      createTenant();
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
                <label className="form-label">Mã khách thuê</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.tenant_id}
                  onChange={(e) => handleFormChange("tenant_id", e.target.value)}
                  required
                  disabled={!!editingTenant}
                />
              </div>
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
                  value={form.phone_number}
                  onChange={(e) => handleFormChange("phone_number", e.target.value)}
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
                <label className="form-label">Địa chỉ</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Giới tính</label>
                <select
                  className="form-select"
                  value={form.gender}
                  onChange={(e) => handleFormChange("gender", e.target.value)}
                >
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Ngày sinh</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.date_of_birth ? form.date_of_birth.substring(0, 10) : ""}
                  onChange={(e) => handleFormChange("date_of_birth", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Ảnh CMND/CCCD mặt trước</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.id_card_front_path}
                  onChange={(e) => handleFormChange("id_card_front_path", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Ảnh CMND/CCCD mặt sau</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.id_card_back_path}
                  onChange={(e) => handleFormChange("id_card_back_path", e.target.value)}
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