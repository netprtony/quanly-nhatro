import React, { useState, useEffect } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:8000/auth/accounts";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form, setForm] = useState({
    username: "",
    full_name: "",
    email: "",
    role: "USER",
    is_active: true,
    password: "",
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  // Lấy danh sách tài khoản từ API
  const fetchAccounts = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      toast.error("Không thể tải danh sách tài khoản!");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Thêm tài khoản mới
  const createAccount = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchAccounts();
      toast.success("✅ Thêm tài khoản thành công!");
      setShowModal(false);
    } catch (err) {
      toast.error("Thêm tài khoản thất bại! " + err.message);
    }
  };

  // Sửa tài khoản
  const updateAccount = async () => {
    try {
      const res = await fetch(`${API_URL}/${editingAccount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchAccounts();
      toast.success("✏️ Cập nhật tài khoản thành công!");
      setShowModal(false);
    } catch (err) {
      toast.error("Cập nhật tài khoản thất bại! " + err.message);
    }
  };

  // Xóa tài khoản
  const deleteAccount = async () => {
    try {
      const res = await fetch(`${API_URL}/${accountToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchAccounts();
      toast.success("🗑️ Xóa tài khoản thành công!");
      setShowConfirmDelete(false);
      setAccountToDelete(null);
    } catch (err) {
      toast.error("Xóa tài khoản thất bại! " + err.message);
    }
  };

  const columns = [
    { label: "ID", accessor: "id" },
    { label: "Tên đăng nhập", accessor: "username" },
    { label: "Họ tên", accessor: "full_name" },
    { label: "Email", accessor: "email" },
    { label: "Quyền", accessor: "role" },
    {
      label: "Trạng thái",
      accessor: "is_active",
      render: (value) => (value ? "✅ Kích hoạt" : "❌ Khóa"),
    },
    {
      label: "Thao tác",
      accessor: "actions",
      render: (_, account) => (
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(account)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(account.id)}>Xóa</button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setForm({
      username: "",
      full_name: "",
      email: "",
      role: "USER",
      is_active: true,
      password: "",
    });
    setEditingAccount(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (account) => {
    setForm({
      username: account.username,
      full_name: account.full_name || "",
      email: account.email,
      role: account.role,
      is_active: account.is_active,
      password: "",
    });
    setEditingAccount(account);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (accountId) => {
    setAccountToDelete(accountId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    deleteAccount();
  };

  const handleSubmitAccount = () => {
    if (editingAccount) {
      updateAccount();
    } else {
      createAccount();
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
        <h3 className="mb-3">👤 Danh sách tài khoản</h3>
        <button className="btn btn-success mb-3" onClick={handleAdd}>
          ➕ Thêm tài khoản
        </button>

        <Table columns={columns} data={accounts} />

        {/* Modal Thêm / Sửa */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingAccount ? "✏️ Chỉnh sửa tài khoản" : "➕ Thêm tài khoản"}
          showConfirm
          onConfirm={handleSubmitAccount}
        >
          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Tên đăng nhập</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.username}
                  onChange={(e) => handleFormChange("username", e.target.value)}
                  required
                  disabled={!!editingAccount}
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
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Quyền</label>
                <select
                  className="form-select"
                  value={form.role}
                  onChange={(e) => handleFormChange("role", e.target.value)}
                  required
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
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
                    Kích hoạt
                  </label>
                </div>
              </div>
              {!editingAccount && (
                <div className="col-12">
                  <label className="form-label">Mật khẩu</label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={(e) => handleFormChange("password", e.target.value)}
                    required
                  />
                </div>
              )}
            </div>
          </form>
        </Modal>

        {/* Modal xác nhận xóa */}
        <ModalConfirm
          isOpen={showConfirmDelete}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa tài khoản này không?"
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