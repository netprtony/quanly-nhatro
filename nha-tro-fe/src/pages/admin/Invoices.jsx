import React, { useState, useEffect } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import AdvancedFilters from "/src/components/AdvancedFilters.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const INVOICE_API = "http://localhost:8000/invoices";
const ROOMS_API = "http://localhost:8000/rooms";
const INVOICE_DETAIL_API = "http://localhost:8000/invoice-details";

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

  // Phân trang
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);

  // --- CRUD chi tiết hóa đơn ---
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [editingDetail, setEditingDetail] = useState(null);
  const [detailForm, setDetailForm] = useState({
    invoice_id: "",
    meter_id: "",
    fee_type: "",
    amount: "",
    note: "",
  });
  const [detailUnsaved, setDetailUnsaved] = useState(false);
  const [showDetailConfirmDelete, setShowDetailConfirmDelete] = useState(false);
  const [detailToDelete, setDetailToDelete] = useState(null);

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
          <button className="btn btn-sm btn-info" onClick={() => handleViewDetail(invoice.invoice_id)}>Xem</button>
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(invoice)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(invoice.invoice_id)}>Xóa</button>
        </div>
      ),
    },
  ];

  // --- CRUD chi tiết hóa đơn ---
  const detailColumns = [
    { label: "ID", accessor: "detail_id" },
    { label: "Chỉ số điện", accessor: "meter_id" },
    { label: "Loại phí", accessor: "fee_type" },
    {
      label: "Số tiền",
      accessor: "amount",
      render: (value) =>
        typeof value === "number"
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value)
          : value,
    },
    { label: "Ghi chú", accessor: "note" },
    {
      label: "Thao tác",
      accessor: "actions",
      render: (_, detail) => (
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-sm btn-warning" onClick={() => handleEditDetail(detail)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteDetail(detail.detail_id)}>Xóa</button>
        </div>
      ),
    },
  ];

  // Lấy danh sách hóa đơn từ API (có phân trang)
  const fetchInvoices = async () => {
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
      const res = await fetch(INVOICE_API + query);
      const data = await res.json();
      setInvoices(Array.isArray(data.items) ? data.items : []);
      setTotalRecords(data.total || 0);
    } catch (err) {
      toast.error("Không thể tải danh sách hóa đơn!");
      setInvoices([]);
      setTotalRecords(0);
    }
  };

  // Lấy danh sách phòng
  const fetchRooms = async () => {
    try {
      const res = await fetch(ROOMS_API);
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Không thể tải danh sách phòng!");
      setRooms([]);
    }
  };

  // Lấy chi tiết hóa đơn theo invoice_id
  const fetchInvoiceDetails = async (invoice_id) => {
    try {
      const res = await fetch(`${INVOICE_DETAIL_API}/by-invoice/${invoice_id}`);
      const data = await res.json();
      setInvoiceDetails(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Không thể tải chi tiết hóa đơn!");
      setInvoiceDetails([]);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchRooms();
    // eslint-disable-next-line
  }, [filters, page, pageSize]);

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

  // Không lọc lại ở frontend, chỉ hiển thị dữ liệu đã phân trang từ backend
  // const filteredInvoices = applyFilters(invoices);

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

  // --- Chi tiết hóa đơn ---
  const handleViewDetail = async (invoice_id) => {
    setSelectedInvoiceId(invoice_id);
    await fetchInvoiceDetails(invoice_id);
    setShowDetailModal(true);
  };

  const handleAddDetail = () => {
    setDetailForm({
      invoice_id: selectedInvoiceId,
      meter_id: "",
      fee_type: "",
      amount: "",
      note: "",
    });
    setEditingDetail(null);
    setDetailUnsaved(false);
  };

  const handleEditDetail = (detail) => {
    setDetailForm({
      invoice_id: detail.invoice_id,
      meter_id: detail.meter_id || "",
      fee_type: detail.fee_type,
      amount: detail.amount,
      note: detail.note || "",
    });
    setEditingDetail(detail);
    setDetailUnsaved(false);
  };

  const handleDeleteDetail = (detailId) => {
    setDetailToDelete(detailId);
    setShowDetailConfirmDelete(true);
  };

  const confirmDeleteDetail = async () => {
    try {
      const res = await fetch(`${INVOICE_DETAIL_API}/${detailToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchInvoiceDetails(selectedInvoiceId);
      toast.success("🗑️ Xóa chi tiết hóa đơn thành công!");
      setShowDetailConfirmDelete(false);
      setDetailToDelete(null);
    } catch (err) {
      toast.error("Xóa chi tiết hóa đơn thất bại! " + err.message);
    }
  };

  const handleSubmitDetail = async () => {
    const payload = {
      ...detailForm,
      invoice_id: selectedInvoiceId,
      meter_id: detailForm.meter_id ? parseInt(detailForm.meter_id) : null,
      amount: detailForm.amount ? parseFloat(detailForm.amount) : 0,
      fee_type: detailForm.fee_type,
      note: detailForm.note,
    };
    try {
      if (editingDetail) {
        const res = await fetch(`${INVOICE_DETAIL_API}/${editingDetail.detail_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("✏️ Cập nhật chi tiết hóa đơn thành công!");
      } else {
        const res = await fetch(INVOICE_DETAIL_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("✅ Thêm chi tiết hóa đơn thành công!");
      }
      await fetchInvoiceDetails(selectedInvoiceId);
      setEditingDetail(null);
      setDetailUnsaved(false);
    } catch (err) {
      toast.error("Lưu chi tiết hóa đơn thất bại! " + err.message);
    }
  };

  const handleDetailFormChange = (field, value) => {
    setDetailForm((prev) => ({ ...prev, [field]: value }));
    setDetailUnsaved(true);
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

        <Table
          columns={columns}
          data={invoices}
          page={page}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />

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

        {/* Modal chi tiết hóa đơn */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`📄 Chi tiết hóa đơn #${selectedInvoiceId}`}
          showConfirm={false}
        >
          <div className="mb-2 d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Danh sách chi tiết hóa đơn</h5>
            <button className="btn btn-success btn-sm" onClick={handleAddDetail}>
              ➕ Thêm chi tiết
            </button>
          </div>
          <Table columns={detailColumns} data={invoiceDetails} />

          {/* Form thêm/sửa chi tiết hóa đơn */}
          {(editingDetail !== null || detailForm.invoice_id) && (
            <form className="mt-3">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Chỉ số điện</label>
                  <input
                    type="number"
                    className="form-control"
                    value={detailForm.meter_id}
                    onChange={(e) => handleDetailFormChange("meter_id", e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Loại phí</label>
                  <input
                    type="text"
                    className="form-control"
                    value={detailForm.fee_type}
                    onChange={(e) => handleDetailFormChange("fee_type", e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Số tiền (VND)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={detailForm.amount}
                    onChange={(e) => handleDetailFormChange("amount", e.target.value)}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Ghi chú</label>
                  <input
                    type="text"
                    className="form-control"
                    value={detailForm.note}
                    onChange={(e) => handleDetailFormChange("note", e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-3 d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmitDetail}
                  disabled={!detailUnsaved}
                >
                  {editingDetail ? "Lưu chỉnh sửa" : "Thêm mới"}
                </button>
                {editingDetail && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingDetail(null);
                      setDetailForm({
                        invoice_id: selectedInvoiceId,
                        meter_id: "",
                        fee_type: "",
                        amount: "",
                        note: "",
                      });
                      setDetailUnsaved(false);
                    }}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          )}

          <ModalConfirm
            isOpen={showDetailConfirmDelete}
            title="Xác nhận xóa"
            message="Bạn có chắc chắn muốn xóa chi tiết hóa đơn này không?"
            confirmText="Xóa"
            cancelText="Hủy"
            onConfirm={confirmDeleteDetail}
            onClose={() => setShowDetailConfirmDelete(false)}
          />
        </Modal>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}