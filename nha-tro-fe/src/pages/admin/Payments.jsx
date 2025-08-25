import React, { useState, useEffect } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import AdvancedFilters from "/src/components/AdvancedFilters.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PAYMENT_API = "http://localhost:8000/payments";
const INVOICE_API = "http://localhost:8000/invoices";

export default function Payment() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [form, setForm] = useState({
    invoice_id: "",
    amount: "",
    date: "",
    method: "Cash",
    note: "",
    transaction_reference: "", // Thêm trường này
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [filters, setFilters] = useState([]);
  const [search, setSearch] = useState("");

  // Phân trang
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortField, setSortField] = useState();
  const [sortOrder, setSortOrder] = useState();
  const fieldOptions = [
    { value: "invoice_id", label: "Phiếu thu", type: "number" },
    { value: "tenant_name", label: "Khách thuê", type: "string" },
    { value: "paid_amount", label: "Số tiền", type: "number" },
    { value: "payment_date", label: "Ngày thanh toán", type: "string" },
    { value: "payment_method", label: "Phương thức", type: "string" },
  ];

  const columns = [
    { label: "ID", accessor: "payment_id" },
    { label: "Phiếu thu", accessor: "invoice_id" },
    { label: "Số phòng", accessor: "room_number" },
    { label: "Khách thuê", accessor: "tenant_name" },
    {
      label: "Số tiền",
      accessor: "paid_amount",
      render: (value) =>
        typeof value === "number"
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value)
          : "N/A",
    },
    {
      label: "Ngày thanh toán",
      accessor: "payment_date",
      render: (value) =>
        value ? new Date(value).toLocaleDateString("vi-VN") : "",
    },
    { label: "Phương thức", accessor: "payment_method" },
    { label: "Mã giao dịch", accessor: "transaction_reference" }, // Thêm trường này
    { label: "Ghi chú", accessor: "note" },
    {
      label: "Thao tác",
      accessor: "actions",
      render: (_, payment) => (
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(payment)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(payment.payment_id)}>Xóa</button>
        </div>
      ),
    },
  ];

  // Export CSV
  const exportCSV = () => {
    if (payments.length === 0) return;
    const headers = Object.keys(payments[0]);
    const csv = [
      headers.join(","),
      ...payments.map((row) =>
        headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments.csv";
    a.click();
  };

  // Export JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(payments, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments.json";
    a.click();
  };

  // Lấy danh sách thanh toán từ API (có phân trang + filter nâng cao)
  const fetchPayments = async (field = sortField, order = sortOrder) => {
    try {
      let url = `${PAYMENT_API}?page=${page}&page_size=${pageSize}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (field) url += `&sort_field=${field}`;
      if (order) url += `&sort_order=${order}`;
      let res, data;
      if (filters.length > 0) {
        res = await fetch(url.replace(PAYMENT_API, PAYMENT_API + "/filter"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters, sort_field: field, sort_order: order }),
        });
      } else {
        res = await fetch(url);
      }
      data = await res.json();
      setPayments(Array.isArray(data.items) ? data.items : []);
      setTotalRecords(data.total || 0);
    } catch (err) {
      toast.error("Không thể tải danh sách thanh toán!");
      setPayments([]);
      setTotalRecords(0);
    }
  };

  // Lấy danh sách hóa đơn để chọn invoice_id
  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${INVOICE_API}?page=1&page_size=200`);
      const data = await res.json();
      setInvoices(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setInvoices([]);
    }
  };

  useEffect(() => {
    fetchPayments(sortField, sortOrder);
    fetchInvoices();
    // eslint-disable-next-line
  }, [filters, page, pageSize, search, sortField, sortOrder]);

  const handleAdd = () => {
    setForm({
      invoice_id: "",
      amount: "",
      date: "",
      method: "Cash",
      note: "",
      transaction_reference: "", // Thêm trường này
    });
    setEditingPayment(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (payment) => {
    setForm({
      invoice_id: payment.invoice_id,
      amount: payment.paid_amount,
      date: payment.payment_date,
      method: payment.payment_method,
      note: payment.note,
      transaction_reference: payment.transaction_reference || "", // Thêm trường này
    });
    setEditingPayment(payment);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (paymentId) => {
    setPaymentToDelete(paymentId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`${PAYMENT_API}/${paymentToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchPayments();
      toast.success("🗑️ Xóa thanh toán thành công!");
      setShowConfirmDelete(false);
      setPaymentToDelete(null);
    } catch (err) {
      toast.error("Xóa thanh toán thất bại! " + err.message);
    }
  };

  const handleSubmitPayment = async () => {
    const payload = {
      invoice_id: form.invoice_id ? parseInt(form.invoice_id) : null,
      paid_amount: form.amount ? parseFloat(form.amount) : 0,
      payment_date: form.date,
      payment_method: form.method,
      note: form.note,
      transaction_reference: form.transaction_reference, // Thêm trường này
    };
    try {
      if (editingPayment) {
        const res = await fetch(`${PAYMENT_API}/${editingPayment.payment_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("✏️ Cập nhật thanh toán thành công!");
      } else {
        const res = await fetch(PAYMENT_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("✅ Thêm thanh toán thành công!");
      }
      await fetchPayments();
      setShowModal(false);
    } catch (err) {
      toast.error("Lưu thanh toán thất bại! " + err.message);
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
          <h3 className="mb-0">💳 Danh sách thanh toán</h3>
          <button className="btn btn-success" onClick={handleAdd}>
            ➕ Thêm thanh toán
          </button>
        </div>

        <div className="mb-3">
          <AdvancedFilters
            fieldOptions={fieldOptions}
            filters={filters}
            onAddFilter={(f) => setFilters((prev) => [...prev, f])}
            onRemoveFilter={(i) => setFilters((prev) => prev.filter((_, idx) => idx !== i))}
            compact
            onLoad={fetchPayments}
            onSearch={setSearch}
            onExportCSV={exportCSV}
            onExportJSON={exportJSON}
          />
        </div>

        <Table
          columns={columns}
          data={payments}
          page={page}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
            fetchInvoices();
          }}
          onSort={(field, order) => {
            setSortField(field);
            setSortOrder(order);
            fetchPayments(field, order);
          }}
          sortField={sortField}
          sortOrder={sortOrder}
        />

        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingPayment ? "✏️ Chỉnh sửa thanh toán" : "➕ Thêm thanh toán"}
          showConfirm
          onConfirm={handleSubmitPayment}
        >
          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Phiếu thu</label>
                <select
                  className="form-select"
                  value={form.invoice_id}
                  onChange={(e) => handleFormChange("invoice_id", e.target.value)}
                  required
                >
                  <option value="">-- Chọn hóa đơn --</option>
                  {invoices.map(inv => (
                    <option key={inv.invoice_id} value={inv.invoice_id}>
                      {`#${inv.invoice_id} - Phòng ${inv.room_id} - Tháng ${inv.month?.slice(0,7)}`}
                    </option>
                  ))}
                </select>
              </div>
              /* XÓA TRƯỜNG KHÁCH THUÊ */}
                      <div className="col-md-6">
                      <label className="form-label">Số tiền (VND)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.amount}
                        onChange={(e) => handleFormChange("amount", parseInt(e.target.value) || 0)}
                        required
                      />
                      </div>
                      <div className="w-100 my-2 border-bottom"></div>
                      <div className="col-md-6">
                      <label className="form-label">Ngày thanh toán</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.date}
                        onChange={(e) => handleFormChange("date", e.target.value)}
                        required
                      />
                      </div>
                      <div className="w-100 my-2 border-bottom"></div>
                      <div className="col-md-6">
                      <label className="form-label">Phương thức</label>
                      <select
                        className="form-select"
                        value={form.method}
                        onChange={(e) => handleFormChange("method", e.target.value)}
                        required
                      >
                        <option value="Cash">Tiền mặt</option>
                        <option value="BankTransfer">Chuyển khoản</option>
                        <option value="Momo">Momo</option>
                        <option value="ZaloPay">ZaloPay</option>
                      </select>
                      </div>
                      <div className="w-100 my-2 border-bottom"></div>
                      <div className="col-12">
                      <label className="form-label">Ghi chú</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.note}
                        onChange={(e) => handleFormChange("note", e.target.value)}
                      />
                      </div>
                      <div className="w-100 my-2 border-bottom"></div>
                      <div className="col-12">
                      <label className="form-label">Mã giao dịch</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.transaction_reference}
                        onChange={(e) => handleFormChange("transaction_reference", e.target.value)}
                        placeholder="Nhập mã giao dịch (nếu có)"
                      />
                      </div>
                    </div>
                    </form>
                  </Modal>

                  <ModalConfirm
                    isOpen={showConfirmDelete}
                    title="Xác nhận xóa"
                    message="Bạn có chắc chắn muốn xóa thanh toán này không?"
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