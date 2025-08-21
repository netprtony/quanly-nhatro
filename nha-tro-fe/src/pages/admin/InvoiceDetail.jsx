import React, { useState, useEffect } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import AdvancedFilters from "/src/components/AdvancedFilters.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const INVOICE_DETAIL_API = "http://localhost:8000/invoice-details";
const INVOICE_API = "http://localhost:8000/invoices";
const FEE_TYPES = [
  { value: "Rent", label: "Thuê phòng" },
  { value: "Electricity", label: "Điện" },
  { value: "Trash", label: "Rác" },
  { value: "Water", label: "Nước" },
  { value: "Wifi", label: "Wifi" },
  { value: "Other", label: "Khác" },
];
const METER_API = "http://localhost:8000/meters"; // API lấy công tơ điện

export default function InvoiceDetail() {
  const [details, setDetails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [form, setForm] = useState({
    invoice_id: "",
    meter_id: "",
    fee_type: "",
    amount: "",
    note: "",
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [detailToDelete, setDetailToDelete] = useState(null);
  const [filters, setFilters] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [meters, setMeters] = useState([]);
  const [autoAmount, setAutoAmount] = useState(null);
  const [latestMeter, setLatestMeter] = useState(null);

  // ==== Pagination states ====
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);

  // Các trường cho bộ lọc nâng cao
  const fieldOptions = [
    { value: "invoice_id", label: "Hóa đơn", type: "number" },
    { value: "meter_id", label: "Chỉ số điện", type: "number" },
    { value: "fee_type", label: "Loại phí", type: "string" },
    { value: "amount", label: "Số tiền", type: "number" },
    { value: "note", label: "Ghi chú", type: "string" },
  ];

  // Lấy danh sách hóa đơn cho combobox
  const fetchInvoices = async () => {
    try {
      const res = await fetch(INVOICE_API);
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Không thể tải danh sách hóa đơn!");
      setInvoices([]); // Đảm bảo luôn là mảng khi lỗi
    }
  };

  // Lấy danh sách chi tiết hóa đơn từ API, có hỗ trợ filter nâng cao và phân trang
  const fetchDetails = async () => {
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
      const res = await fetch(INVOICE_DETAIL_API + query);
      const data = await res.json();
      setDetails(Array.isArray(data.items) ? data.items : []);
      setTotalRecords(data.total || 0);
    } catch (err) {
      toast.error("Không thể tải danh sách chi tiết hóa đơn!");
    }
  };

  // Lấy công tơ điện tháng gần nhất của hóa đơn đang chọn
  const fetchLatestMeter = async (invoice_id) => {
    try {
      if (!invoice_id) return;
      const res = await fetch(`http://localhost:8000/electricity/latest?invoice_id=${invoice_id}`);
      if (!res.ok) return;
      const data = await res.json();
      setMeters([data]);
      setLatestMeter(data);
      setAutoAmount(data.total_amount); // thành tiền
    } catch (err) {
      setMeters([]);
      setLatestMeter(null);
      setAutoAmount(null);
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchInvoices();
    // eslint-disable-next-line
  }, [filters, page, pageSize]);

  // Khi chọn loại phí là Electricity thì load công tơ điện
  useEffect(() => {
    if (form.fee_type === "Electricity" && form.invoice_id) {
      fetchLatestMeter(form.invoice_id);
    } else {
      setMeters([]);
      setLatestMeter(null);
      setAutoAmount(null);
    }
  }, [form.fee_type, form.invoice_id]);

  const columns = [
    { label: "ID", accessor: "detail_id" },
    { label: "Hóa đơn", accessor: "invoice_id" },
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
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(detail)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(detail.detail_id)}>Xóa</button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setForm({
      invoice_id: "",
      meter_id: "",
      fee_type: "",
      amount: "",
      note: "",
    });
    setEditingDetail(null);
    setUnsavedChanges(false);
    setShowModal(true);
    setMeters([]);
    setAutoAmount(null);
  };

  const handleEdit = (detail) => {
    setForm({
      invoice_id: detail.invoice_id,
      meter_id: detail.meter_id || "",
      fee_type: detail.fee_type,
      amount: detail.amount,
      note: detail.note || "",
    });
    setEditingDetail(detail);
    setUnsavedChanges(false);
    setShowModal(true);
    if (detail.fee_type === "Electricity" && detail.invoice_id) {
      fetchLatestMeter(detail.invoice_id);
    } else {
      setMeters([]);
      setAutoAmount(null);
    }
  };

  const handleDelete = (detailId) => {
    setDetailToDelete(detailId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`${INVOICE_DETAIL_API}/${detailToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchDetails();
      toast.success("🗑️ Xóa chi tiết hóa đơn thành công!");
      setShowConfirmDelete(false);
      setDetailToDelete(null);
    } catch (err) {
      toast.error("Xóa chi tiết hóa đơn thất bại! " + err.message);
    }
  };

  const handleSubmitDetail = async () => {
    const payload = {
      ...form,
      invoice_id: form.invoice_id ? parseInt(form.invoice_id) : null,
      meter_id: form.meter_id ? parseInt(form.meter_id) : null,
      amount: autoAmount !== null ? autoAmount : (form.amount ? parseFloat(form.amount) : 0),
      fee_type: form.fee_type,
      note: form.note,
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
      await fetchDetails();
      setShowModal(false);
    } catch (err) {
      toast.error("Lưu chi tiết hóa đơn thất bại! " + err.message);
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
    // Nếu chọn loại phí là Electricity thì reset meter và autoAmount
    if (field === "fee_type" && value !== "Electricity") {
      setMeters([]);
      setAutoAmount(null);
    }
  };

  return (
    <div className="container mt-4 position-relative">
      <div className="p-4 rounded shadow bg-white">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="mb-0">📄 Chi tiết hóa đơn</h3>
          <button className="btn btn-success" onClick={handleAdd}>
            ➕ Thêm chi tiết
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
          data={details}
          page={page}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1); // reset về trang 1 khi đổi pageSize
          }}
        />

        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingDetail ? "✏️ Chỉnh sửa chi tiết hóa đơn" : "➕ Thêm chi tiết hóa đơn"}
          showConfirm
          onConfirm={handleSubmitDetail}
        >
          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Hóa đơn</label>
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
              <div className="col-md-6">
                <label className="form-label">Loại phí</label>
                <select
                  className="form-select"
                  value={form.fee_type}
                  onChange={(e) => handleFormChange("fee_type", e.target.value)}
                  required
                >
                  <option value="">-- Chọn loại phí --</option>
                  {FEE_TYPES.map(ft => (
                    <option key={ft.value} value={ft.value}>{ft.label}</option>
                  ))}
                </select>
              </div>
              {form.fee_type === "Electricity" && latestMeter && (
                <>
                  <div className="col-md-6">
                    <label className="form-label">Chỉ số điện</label>
                    <input
                      type="text"
                      className="form-control"
                      value={`Cũ: ${latestMeter.old_reading} | Mới: ${latestMeter.new_reading}`}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Số kWh</label>
                    <input
                      type="text"
                      className="form-control"
                      value={latestMeter.usage_kwh}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Thành tiền (VND)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={latestMeter.total_amount?.toLocaleString("vi-VN")}
                      readOnly
                    />
                  </div>
                </>
              )}
              <div className="col-md-6">
                <label className="form-label">Số tiền (VND)</label>
                <input
                  type="text"
                  className="form-control"
                  value={
                    autoAmount !== null
                      ? autoAmount.toLocaleString("vi-VN")
                      : form.amount
                        ? Number(form.amount).toLocaleString("vi-VN")
                        : ""
                  }
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, "");
                    handleFormChange("amount", raw);
                  }}
                  required
                  readOnly={form.fee_type === "Electricity" && autoAmount !== null}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <div className="col-12">
                <label className="form-label">Ghi chú</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.note}
                  onChange={(e) => handleFormChange("note", e.target.value)}
                />
              </div>
            </div>
          </form>
        </Modal>

        <ModalConfirm
          isOpen={showConfirmDelete}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa chi tiết hóa đơn này không?"
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