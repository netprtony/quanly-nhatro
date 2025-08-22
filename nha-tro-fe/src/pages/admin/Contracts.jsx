import React, { useState, useEffect } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdvancedFilters from "/src/components/AdvancedFilters.jsx";

const API_URL = "http://localhost:8000/contracts";
const ROOMS_API = "http://localhost:8000/rooms";
const TENANTS_API = "http://localhost:8000/tenants";

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [form, setForm] = useState({
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
  const [filters, setFilters] = useState([]);
  // Phân trang
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  // Bộ lọc nâng cao: fieldOptions cho Contract
  const fieldOptions = [
    { label: "Phòng", value: "room_id" },
    { label: "Khách thuê", value: "tenant_id" },
    { label: "Ngày bắt đầu", value: "start_date" },
    { label: "Ngày kết thúc", value: "end_date" },
    { label: "Tiền cọc", value: "deposit_amount" },
    { label: "Tiền thuê", value: "monthly_rent" },
    { label: "Trạng thái", value: "contract_status" },
  ];

  // Load danh sách hợp đồng từ API
  const fetchContracts = async () => {
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
      const res = await fetch(API_URL + query);
      const data = await res.json();
      setContracts(data.items);
      setTotalRecords(data.total);
    } catch (err) {
      toast.error("Không thể tải danh sách hợp đồng!");
      setContracts([]);
      setTotalRecords(0);
    }
  };


  // Load danh sách phòng cho combobox
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

  // Load danh sách khách thuê cho combobox
  const fetchTenants = async () => {
    try {
      const res = await fetch(`${TENANTS_API}?page=1&page_size=200`);
      const data = await res.json();
      setTenants(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      toast.error("Không thể tải danh sách khách thuê!");
      setTenant([]);
    }
  };

  useEffect(() => {
    fetchContracts();
    fetchRooms();
    fetchTenants();
    // eslint-disable-next-line
  }, [filters]);

  // Thêm mới hợp đồng
  const createContract = async () => {
    try {
      const payload = {
        ...form,
        room_id: form.room_id ? parseInt(form.room_id) : null,
        tenant_id: form.tenant_id,
        deposit_amount: form.deposit_amount ? parseFloat(form.deposit_amount) : 0,
        monthly_rent: form.monthly_rent ? parseFloat(form.monthly_rent) : 0,
      };
      const res = await fetch(API_URL, {
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

  // Sửa hợp đồng
  const updateContract = async () => {
    try {
      const payload = {
        ...form,
        room_id: form.room_id ? parseInt(form.room_id) : null,
        tenant_id: form.tenant_id,
        deposit_amount: form.deposit_amount ? parseFloat(form.deposit_amount) : 0,
        monthly_rent: form.monthly_rent ? parseFloat(form.monthly_rent) : 0,
      };
      const res = await fetch(`${API_URL}/${editingContract.contract_id}`, {
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

  // Xóa hợp đồng
  const deleteContract = async () => {
    try {
      const res = await fetch(`${API_URL}/${contractToDelete}`, {
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
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value)
          : "N/A",
    },
    {
      label: "Tiền thuê",
      accessor: "monthly_rent",
      render: (value) =>
        typeof value === "number"
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value)
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

  const handleAdd = () => {
    setForm({
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

  // Xử lý thêm/xóa filter
  const handleAddFilter = (filter) => {
    setFilters((prev) => [...prev, filter]);
  };
  const handleRemoveFilter = (index) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mt-4 position-relative">
      <div className="p-4 rounded shadow bg-white">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="mb-3">📄 Danh sách hợp đồng</h3>
          <button className="btn btn-success mb-3" onClick={handleAdd}>
            ➕ Thêm hợp đồng
          </button>
        </div>
        {/* Bộ lọc nâng cao */}
        <AdvancedFilters
          fieldOptions={fieldOptions}
          filters={filters}
          onAddFilter={handleAddFilter}
          onRemoveFilter={handleRemoveFilter}
        />
       

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
                  type="number"
                  className="form-control"
                  value={form.deposit_amount}
                  onChange={(e) => handleFormChange("deposit_amount", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Tiền thuê (VND)</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.monthly_rent}
                  onChange={(e) => handleFormChange("monthly_rent", e.target.value)}
                  required
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