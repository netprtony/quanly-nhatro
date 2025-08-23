import React, { useState, useEffect } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import AdvancedFilters from "/src/components/AdvancedFilters.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CONTRACT_URL = "http://localhost:8000/contracts";
const ROOMS_API = "http://localhost:8000/rooms";
const TENANTS_API = "http://localhost:8000/tenants";

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [form, setForm] = useState({
    contract_id: "",
    room_id: "",
    tenant_id: "",
    start_date: "",
    end_date: "",
    deposit_amount: "",
    monthly_rent: "",
    contract_status: "Active",
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);

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
    { value: "contract_id", label: "Mã hợp đồng", type: "number" },
    { value: "room_id", label: "Phòng", type: "number" },
    { value: "tenant_id", label: "Khách thuê", type: "number" },
    { value: "start_date", label: "Ngày bắt đầu", type: "string" },
    { value: "end_date", label: "Ngày kết thúc", type: "string" },
    { value: "deposit_amount", label: "Tiền cọc", type: "number" },
    { value: "monthly_rent", label: "Tiền thuê", type: "number" },
    { value: "contract_status", label: "Trạng thái", type: "string" },
  ];

  const columns = [
    { label: "ID", accessor: "contract_id" },
    {
      label: "Phòng",
      accessor: "room_id",
      render: (room_id) => {
        const room = rooms.find((r) => r.room_id === room_id);
        return room ? room.room_number : room_id;
      },
    },
    {
      label: "Khách thuê",
      accessor: "tenant_id",
      render: (tenant_id) => {
        const tenant = tenants.find((t) => t.tenant_id === tenant_id);
        return tenant ? tenant.full_name : tenant_id;
      },
    },
    { label: "Ngày bắt đầu", accessor: "start_date" },
    { label: "Ngày kết thúc", accessor: "end_date" },
    {
      label: "Tiền cọc",
      accessor: "deposit_amount",
      render: (value) =>
        typeof value === "number"
          ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
          : "N/A",
    },
    {
      label: "Tiền thuê",
      accessor: "monthly_rent",
      render: (value) =>
        typeof value === "number"
          ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
          : "N/A",
    },
    {
      label: "Trạng thái",
      accessor: "contract_status",
      render: (value) => {
        if (value === "Active") return "✅ Hiệu lực";
        if (value === "Terminated") return "❌ Hết hạn";
        if (value === "Pending") return "⏳ Chờ hiệu lực";
        return value;
      },
    },
    {
      label: "Thao tác",
      accessor: "actions",
      render: (_, contract) => (
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(contract)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(contract.contract_id)}>Xóa</button>
        </div>
      ),
    },
  ];

  // Lấy danh sách contracts từ API (phân trang, lọc, sort)
  const fetchContracts = async (field = sortField, order = sortOrder) => {
    try {
      let url = `${CONTRACT_URL}?page=${page}&page_size=${pageSize}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (field) url += `&sort_field=${field}`;
      if (order) url += `&sort_order=${order}`;
      let res, data;
      if (filters.length > 0) {
        res = await fetch(url.replace(CONTRACT_URL, CONTRACT_URL + "/filter"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters, sort_field: field, sort_order: order }),
        });
      } else {
        res = await fetch(url);
      }
      data = await res.json();
      setContracts(Array.isArray(data.items) ? data.items : []);
      setTotalRecords(data.total || 0);
    } catch (err) {
      toast.error("Không thể tải danh sách hợp đồng!");
      setContracts([]);
      setTotalRecords(0);
    }
  };

  // Lấy danh sách phòng cho combobox
  const fetchRooms = async () => {
    try {
      const res = await fetch(`${ROOMS_API}?page=1&page_size=200`);
      const data = await res.json();
      setRooms(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      toast.error("Không thể tải danh sách phòng!");
      setRooms([]);
    }
  };

  // Lấy danh sách khách thuê cho combobox
  const fetchTenants = async () => {
    try {
      const res = await fetch(`${TENANTS_API}?page=1&page_size=200`);
      const data = await res.json();
      setTenants(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      toast.error("Không thể tải danh sách khách thuê!");
      setTenants([]);
    }
  };

  useEffect(() => {
    fetchContracts();
    fetchRooms();
    fetchTenants();
    // eslint-disable-next-line
  }, [filters, page, pageSize, search, sortField, sortOrder]);

  // Export CSV
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

  // CRUD
  const createContract = async () => {
    try {
      const payload = {
        ...form,
        room_id: form.room_id ? parseInt(form.room_id) : null,
        tenant_id: form.tenant_id,
        deposit_amount: form.deposit_amount ? parseFloat(form.deposit_amount) : 0,
        monthly_rent: form.monthly_rent ? parseFloat(form.monthly_rent) : 0,
      };
      const res = await fetch(CONTRACT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchContracts();
      toast.success("✅ Thêm hợp đồng thành công!");
      setShowModal(false);
    } catch (err) {
      toast.error("Thêm hợp đồng thất bại! " + err.message);
    }
  };

  const updateContract = async () => {
    try {
      const payload = {
        ...form,
        room_id: form.room_id ? parseInt(form.room_id) : null,
        tenant_id: form.tenant_id,
        deposit_amount: form.deposit_amount ? parseFloat(form.deposit_amount) : 0,
        monthly_rent: form.monthly_rent ? parseFloat(form.monthly_rent) : 0,
      };
      const res = await fetch(`${CONTRACT_URL}/${editingContract.contract_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchContracts();
      toast.success("✏️ Cập nhật hợp đồng thành công!");
      setShowModal(false);
    } catch (err) {
      toast.error("Cập nhật hợp đồng thất bại! " + err.message);
    }
  };

  const deleteContract = async () => {
    try {
      const res = await fetch(`${CONTRACT_URL}/${contractToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchContracts();
      toast.success("🗑️ Xóa hợp đồng thành công!");
      setShowConfirmDelete(false);
      setContractToDelete(null);
    } catch (err) {
      toast.error("Xóa hợp đồng thất bại! " + err.message);
    }
  };

  const handleAdd = () => {
    setForm({
      contract_id: "",
      room_id: "",
      tenant_id: "",
      start_date: "",
      end_date: "",
      deposit_amount: "",
      monthly_rent: "",
      contract_status: "Active",
    });
    setEditingContract(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (contract) => {
    setForm({
      contract_id: contract.contract_id,
      room_id: contract.room_id ? String(contract.room_id) : "",
      tenant_id: contract.tenant_id || "",
      start_date: contract.start_date || "",
      end_date: contract.end_date || "",
      deposit_amount: contract.deposit_amount || "",
      monthly_rent: contract.monthly_rent || "",
      contract_status: contract.contract_status || "Active",
    });
    setEditingContract(contract);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (contractId) => {
    setContractToDelete(contractId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    deleteContract();
  };

  const handleSubmitContract = () => {
    if (editingContract) {
      updateContract();
    } else {
      createContract();
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
          <h3 className="mb-0">📄 Danh sách hợp đồng</h3>
          <button className="btn btn-success" onClick={handleAdd}>
            ➕ Thêm hợp đồng
          </button>
        </div>

        <div className="mb-3">
          <AdvancedFilters
            fieldOptions={fieldOptions}
            filters={filters}
            onAddFilter={(f) => setFilters((prev) => [...prev, f])}
            onRemoveFilter={(i) => setFilters((prev) => prev.filter((_, idx) => idx !== i))}
            compact
            onLoad={fetchContracts}
            onSearch={setSearch}
            onExportCSV={exportCSV}
            onExportJSON={exportJSON}
          />
        </div>

        <Table
          columns={columns}
          data={contracts}
          page={page}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
            fetchRooms();
          }}
          onSort={(field, order) => {
            setSortField(field);
            setSortOrder(order);
            fetchContracts(field, order);
          }}
          sortField={sortField}
          sortOrder={sortOrder}
        />

        {/* Modal Thêm / Sửa */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingContract ? "✏️ Chỉnh sửa hợp đồng" : "➕ Thêm hợp đồng"}
          showConfirm
          onConfirm={handleSubmitContract}
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
                <label className="form-label">Khách thuê</label>
                <select
                  className="form-select"
                  value={form.tenant_id}
                  onChange={(e) => handleFormChange("tenant_id", e.target.value)}
                  required
                >
                  <option value="">-- Chọn khách thuê --</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.tenant_id} value={tenant.tenant_id}>
                      {tenant.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Ngày bắt đầu</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.start_date}
                  onChange={(e) => handleFormChange("start_date", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Ngày kết thúc</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.end_date}
                  onChange={(e) => handleFormChange("end_date", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Tiền cọc (VND)</label>
                <input
                  type="text"
                  className="form-control"
                  value={
                    form.deposit_amount
                      ? new Intl.NumberFormat("vi-VN").format(form.deposit_amount)
                      : ""
                  }
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    handleFormChange("deposit_amount", raw ? Number(raw) : "");
                  }}
                  required
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Tiền thuê (VND)</label>
                <input
                  type="text"
                  className="form-control"
                  value={
                    form.monthly_rent
                      ? new Intl.NumberFormat("vi-VN").format(form.monthly_rent)
                      : ""
                  }
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    handleFormChange("monthly_rent", raw ? Number(raw) : "");
                  }}
                  required
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <div className="col-12">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  value={form.contract_status}
                  onChange={(e) => handleFormChange("contract_status", e.target.value)}
                  required
                >
                  <option value="Active">Hiệu lực</option>
                  <option value="Terminated">Đã kết thúc</option>
                  <option value="Pending">Chờ hiệu lực</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>

        {/* Modal xác nhận xóa */}
        <ModalConfirm
          isOpen={showConfirmDelete}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa hợp đồng này không?"
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