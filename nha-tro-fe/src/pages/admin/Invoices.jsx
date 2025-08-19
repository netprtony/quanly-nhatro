import React, { useState, useEffect } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdvancedFilters from "/src/components/AdvancedFilters.jsx";

const INVOICE_API = "http://localhost:8000/invoices";
const ROOMS_API = "http://localhost:8000/rooms";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [form, setForm] = useState({
    room_id: "",
    month: "",
    total_amount: "",
    is_paid: false,
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [filters, setFilters] = useState([]);

  // Các trường cho bộ lọc nâng cao
  const fieldOptions = [
    { value: "room_id", label: "Phòng", type: "number" },
    { value: "month", label: "Tháng", type: "string" },
    { value: "total_amount", label: "Số tiền", type: "number" },
    { value: "is_paid", label: "Trạng thái", type: "boolean" },
  ];

  const columns = [
    { label: "ID", accessor: "invoice_id" },
    {
      label: "Phòng",
      accessor: "room_id",
      render: (room_id) => {
        const room = rooms.find((r) => r.room_id === room_id);
        return room ? room.room_number : room_id;
      },
    },
    { label: "Tháng", accessor: "month" },
    {
      label: "Số tiền",
      accessor: "total_amount",
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
      accessor: "is_paid",
      render: (is_paid) => (is_paid ? "Đã thanh toán" : "Chưa thanh toán"),
    },
    { label: "Ngày tạo", accessor: "created_at" },
    {
      label: "Thao tác",
      accessor: "actions",
      render: (_, invoice) => (
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(invoice)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(invoice.invoice_id)}>Xóa</button>
        </div>
      ),
    },
  ];

  // Lấy danh sách hóa đơn từ API
  const fetchInvoices = async () => {
    try {
      const res = await fetch(INVOICE_API);
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      toast.error("Không thể tải danh sách hóa đơn!");
    }
  };

  // Lấy danh sách phòng
  const fetchRooms = async () => {
    try {
      const res = await fetch(ROOMS_API);
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      toast.error("Không thể tải danh sách phòng!");
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchRooms();
  }, []);

  // --- Advanced filter logic giống Rooms.jsx ---
  const getValueByPath = (obj, path) => {
    return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj);
  };

  const evaluateFilter = (f, invoice) => {
    const raw = getValueByPath(invoice, f.field);
    if (raw === undefined || raw === null) return false;

    // normalize boolean field input
    if (f.field === 'is_paid') {
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

  const filteredInvoices = applyFilters(invoices);

  // --- End advanced filter logic ---

  const handleAdd = () => {
    setForm({
      room_id: "",
      month: "",
      total_amount: "",
      is_paid: false,
    });
    setEditingInvoice(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (invoice) => {
    setForm({
      room_id: invoice.room_id ? String(invoice.room_id) : "",
      month: invoice.month ? invoice.month.slice(0, 7) : "",
      total_amount: invoice.total_amount || "",
      is_paid: invoice.is_paid,
    });
    setEditingInvoice(invoice);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (invoiceId) => {
    setInvoiceToDelete(invoiceId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`${INVOICE_API}/${invoiceToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchInvoices();
      toast.success("🗑️ Xóa hóa đơn thành công!");
      setShowConfirmDelete(false);
      setInvoiceToDelete(null);
    } catch (err) {
      toast.error("Xóa hóa đơn thất bại! " + err.message);
    }
  };

  const handleSubmitInvoice = async () => {
    const payload = {
      ...form,
      room_id: form.room_id ? parseInt(form.room_id) : null,
      total_amount: form.total_amount ? parseFloat(form.total_amount) : 0,
      is_paid: form.is_paid,
      month: form.month ? form.month + "-01" : "", // chuyển từ yyyy-MM sang yyyy-MM-01
    };
    try {
      if (editingInvoice) {
        const res = await fetch(`${INVOICE_API}/${editingInvoice.invoice_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("✏️ Cập nhật hóa đơn thành công!");
      } else {
        const res = await fetch(INVOICE_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("✅ Thêm hóa đơn thành công!");
      }
      await fetchInvoices();
      setShowModal(false);
    } catch (err) {
      toast.error("Lưu hóa đơn thất bại! " + err.message);
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
          <h3 className="mb-0">💵 Danh sách hóa đơn</h3>
          <button className="btn btn-success" onClick={handleAdd}>
            ➕ Thêm hóa đơn
          </button>
        </div>

        <div className="mb-3">
          <AdvancedFilters
            fieldOptions={fieldOptions}
            filters={filters}
            onAddFilter={(f) => setFilters((prev) => [...prev, f])}
            onRemoveFilter={(i) => setFilters((prev) => prev.filter((_, idx) => idx !== i))}
            compact
          />
        </div>

        <Table columns={columns} data={filteredInvoices} />

        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingInvoice ? "✏️ Chỉnh sửa hóa đơn" : "➕ Thêm hóa đơn"}
          showConfirm
          onConfirm={handleSubmitInvoice}
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
                  {rooms.map(room => (
                    <option key={room.room_id} value={room.room_id}>
                      {room.room_number}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Tháng</label>
                <input
                  type="month"
                  className="form-control"
                  value={form.month}
                  onChange={(e) => handleFormChange("month", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Số tiền (VND)</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.total_amount}
                  onChange={(e) => handleFormChange("total_amount", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  value={form.is_paid ? "true" : "false"}
                  onChange={(e) => handleFormChange("is_paid", e.target.value === "true")}
                  required
                >
                  <option value="false">Chưa thanh toán</option>
                  <option value="true">Đã thanh toán</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>

        <ModalConfirm
          isOpen={showConfirmDelete}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa hóa đơn này không?"
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={confirmDelete}
          onClose={() => setShowConfirmDelete(false)}
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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}