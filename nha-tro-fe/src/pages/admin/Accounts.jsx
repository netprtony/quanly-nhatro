import React, { useState } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Accounts() {
  // Mock dữ liệu tài khoản
  const [accounts, setAccounts] = useState([
    {
      account_id: 1,
      username: "admin",
      full_name: "Nguyễn Văn A",
      email: "admin@example.com",
      role: "ADMIN",
      is_active: true,
    },
    {
      account_id: 2,
      username: "user1",
      full_name: "Trần Thị B",
      email: "user1@example.com",
      role: "USER",
      is_active: true,
    },
    {
      account_id: 3,
      username: "user2",
      full_name: "Lê Văn C",
      email: "user2@example.com",
      role: "USER",
      is_active: false,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form, setForm] = useState({
    username: "",
    full_name: "",
    email: "",
    role: "USER",
    is_active: true,
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const columns = [
    { label: "ID", accessor: "account_id" },
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
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(account.account_id)}>Xóa</button>
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
    });
    setEditingAccount(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (account) => {
    setForm({
      username: account.username,
      full_name: account.full_name,
      email: account.email,
      role: account.role,
      is_active: account.is_active,
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
    setAccounts((prev) => prev.filter((a) => a.account_id !== accountToDelete));
    toast.success("🗑️ Xóa tài khoản thành công!");
    setShowConfirmDelete(false);
    setAccountToDelete(null);
  };

  const handleSubmitAccount = () => {
    if (editingAccount) {
      // Sửa tài khoản
      setAccounts((prev) =>
        prev.map((a) =>
          a.account_id === editingAccount.account_id
            ? { ...a, ...form }
            : a
        )
      );
      toast.success("✏️ Cập nhật tài khoản thành công!");
    } else {
      // Thêm tài khoản mới
      setAccounts((prev) => [
        ...prev,
        {
          ...form,
          account_id: prev.length ? Math.max(...prev.map((a) => a.account_id)) + 1 : 1,
        },
      ]);
      toast.success("✅ Thêm tài khoản thành công!");
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