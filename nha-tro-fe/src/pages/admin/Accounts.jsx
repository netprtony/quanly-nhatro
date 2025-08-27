import React, { useState, useEffect } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import AdvancedFilters from "/src/components/AdvancedFilters.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ACCOUNT_URL = "http://localhost:8000/accounts";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form, setForm] = useState({
    id: "",
    username: "",
    email: "",
    role: "USER",
    is_active: true,
    password: "",
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  // Bộ lọc nâng cao, tìm kiếm, phân trang, sort
  const [filters, setFilters] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortField, setSortField] = useState();
  const [sortOrder, setSortOrder] = useState();

  // Cấu hình bộ lọc nâng cao
  const fieldOptions = [
    { value: "id", label: "ID", type: "number" },
    { value: "username", label: "Tên đăng nhập", type: "string" },
    { value: "email", label: "Email", type: "string" },
    { value: "role", label: "Quyền", type: "string" },
    { value: "is_active", label: "Trạng thái", type: "boolean" },
  ];

  const columns = [
    { label: "ID", accessor: "id" },
    { label: "Tên đăng nhập", accessor: "username" },
    { label: "Email", accessor: "email" },
    { label: "Quyền", accessor: "role" },
    {
      label: "Trạng thái",
      accessor: "is_active",
      render: (value) => (value ? 
        <span className="badge bg-success">Kích hoạt</span> :
        <span className="badge bg-danger">Khóa</span>),
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

  // Lấy danh sách accounts từ API (phân trang, lọc, sort)
  const fetchAccounts = async (field = sortField, order = sortOrder) => {
    try {
      let url = `${ACCOUNT_URL}?page=${page}&page_size=${pageSize}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (field) url += `&sort_field=${field}`;
      if (order) url += `&sort_order=${order}`;
      let res, data;
      if (filters.length > 0) {
        res = await fetch(url.replace(ACCOUNT_URL, ACCOUNT_URL + "/filter"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters, sort_field: field, sort_order: order }),
        });
      } else {
        res = await fetch(url);
      }
      data = await res.json();
      setAccounts(Array.isArray(data.items) ? data.items : []);
      setTotalRecords(data.total || 0);
    } catch (err) {
      toast.error("Không thể tải danh sách tài khoản!");
      setAccounts([]);
      setTotalRecords(0);
    }
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line
  }, [filters, page, pageSize, search, sortField, sortOrder]);

  // Export CSV
  const exportCSV = () => {
    if (accounts.length === 0) return;
    const headers = Object.keys(accounts[0]);
    const csv = [
      headers.join(","),
      ...accounts.map((row) =>
        headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "accounts.csv";
    a.click();
  };

  // Export JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(accounts, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "accounts.json";
    a.click();
  };

  // CRUD
  const createAccount = async () => {
    try {
      const res = await fetch(ACCOUNT_URL, {
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

  const updateAccount = async () => {
    try {
      const res = await fetch(`${ACCOUNT_URL}/${editingAccount.id}`, {
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

  const deleteAccount = async () => {
    try {
      const res = await fetch(`${ACCOUNT_URL}/${accountToDelete}`, {
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

  const handleAdd = () => {
    setForm({
      id: "",
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
      id: account.id,
      username: account.username,
      full_name: account.full_name || "",
      email: account.email || "",
      role: account.role || "USER",
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
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="mb-0">👤 Danh sách tài khoản</h3>
          <button className="btn btn-success" onClick={handleAdd}>
            ➕ Thêm tài khoản
          </button>
        </div>

        <div className="mb-3">
          <AdvancedFilters
            fieldOptions={fieldOptions}
            filters={filters}
            onAddFilter={(f) => setFilters((prev) => [...prev, f])}
            onRemoveFilter={(i) => setFilters((prev) => prev.filter((_, idx) => idx !== i))}
            compact
            onLoad={fetchAccounts}
            onSearch={setSearch}
            onExportCSV={exportCSV}
            onExportJSON={exportJSON}
          />
        </div>

        <Table
          columns={columns}
          data={accounts}
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
            fetchAccounts(field, order);
          }}
          sortField={sortField}
          sortOrder={sortOrder}
        />

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