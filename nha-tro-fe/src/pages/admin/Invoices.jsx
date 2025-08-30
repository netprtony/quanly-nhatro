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
const INVOICE_EXPORT_API = "http://localhost:8000/invoices/export";

const FEE_TYPES = [
  { value: "Rent", label: "Thuê phòng" },
  { value: "Electricity", label: "Điện" },
  { value: "Trash", label: "Rác" },
  { value: "Water", label: "Nước" },
  { value: "Wifi", label: "Wifi" },
  { value: "Other", label: "Khác" },
];

const ELECTRICITY_API = "http://localhost:8000/electricity";
const WATER_API = "http://localhost:8000/water";

const DEFAULT_FEES = [
  { key: "Trash", label: "Rác", defaultAmount: 50000 },
  // { key: "Water", label: "Nước", defaultAmount: 300000 }, // ❌ Bỏ phí nước mặc định
  { key: "Wifi", label: "Wifi", defaultAmount: 30000 },
];

export default function Invoices() {
  const [electricityMeters, setElectricityMeters] = useState([]);
  const [waterMeters, setWaterMeters] = useState([]);
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
  const [defaultFees, setDefaultFees] = useState(
    DEFAULT_FEES.map(fee => ({
      ...fee,
      checked: true,
      amount: fee.defaultAmount,
    }))
  );
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [filters, setFilters] = useState([]);
  const [search, setSearch] = useState("");

  // Phân trang
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);

  const [pageDetail, setPageDetail] = useState(1);
  const [pageSizeDetail, setPageSizeDetail] = useState(20);
  const [totalRecordsDetail, setTotalRecordsDetail] = useState(0);

  // --- CRUD chi tiết hóa đơn ---
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [editingDetail, setEditingDetail] = useState(null);
  const [detailForm, setDetailForm] = useState({
    invoice_id: "",
    electricity_meter_id: "",
    water_meter_id: "",
    fee_type: "",
    amount: "",
    note: "",
  });
  const [detailUnsaved, setDetailUnsaved] = useState(false);
  const [showDetailConfirmDelete, setShowDetailConfirmDelete] = useState(false);
  const [detailToDelete, setDetailToDelete] = useState(null);

  const [sortField, setSortField] = useState();
  const [sortOrder, setSortOrder] = useState();
  // sắp sắp bảng
  const [detailSortField, setDetailSortField] = useState();
  const [detailSortOrder, setDetailSortOrder] = useState();
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
       render: (is_paid) =>
        is_paid ? (
          <span className="badge bg-success">Đã thanh toán</span>
        ) : (
          <span className="badge bg-warning text-dark">Chưa thanh toán</span>
        ),
    },
    {
      label: "Ngày tạo",
      accessor: "created_at",
      render: (value) => {
        if (!value) return "";
        const date = new Date(value);
        const pad = (n) => n.toString().padStart(2, "0");
        return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
      },
    },
    {
      label: "Thao tác",
      accessor: "actions",
      render: (_, invoice) => (
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-sm btn-info" onClick={() => handleViewDetail(invoice.invoice_id)}>Xem</button>
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(invoice)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(invoice.invoice_id)}>Xóa</button>
          <button
            className="btn btn-sm btn-success"
            onClick={() => handleExportInvoice(invoice)}
            disabled={loadingExport}
            title="Tạo/Xuất hóa đơn"
          >
            {loadingExport ? "Đang xuất..." : "Tạo file"}
          </button>
        </div>
      ),
    },
  ];

  // --- CRUD chi tiết hóa đơn ---
  const detailColumns = [
    { label: "ID", accessor: "detail_id" },
    { label: "Công tơ điện", accessor: "electricity_meter_id" },
    { label: "Công tơ nước", accessor: "water_meter_id" },
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
  // Export CSV
  const exportCSV = () => {
    if (invoices.length === 0) return;
    const headers = Object.keys(invoices[0]);
    const csv = [
      headers.join(","),
      ...invoices.map((row) =>
        headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoices.csv";
    a.click();
  };

  // Export JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(invoices, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoices.json";
    a.click();
  };
  // Lấy danh sách hóa đơn từ API (có phân trang + filter nâng cao)
const fetchInvoices = async (field = sortField, order = sortOrder) => {
  try {
    let url = `${INVOICE_API}?page=${page}&page_size=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (field) url += `&sort_field=${field}`;
    if (order) url += `&sort_order=${order}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    let res, data;

    if (filters.length > 0) {
      // gọi POST filter
      res = await fetch(url.replace(INVOICE_API, INVOICE_API + "/filter"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filters, sort_field: field, sort_order: order }),
      });
    } else {
      // gọi GET bình thường
      res = await fetch(url);
    }

    data = await res.json();

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
      // có phân trang, mặc định lấy 1 trang lớn để đủ dữ liệu
      const res = await fetch(`${ROOMS_API}?page=1&page_size=200`);
      const data = await res.json();
      setRooms(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      toast.error("Không thể tải danh sách phòng!");
      setRooms([]);
    }
  };

  // Lấy chi tiết hóa đơn theo invoice_id
  const fetchInvoiceDetails = async (invoice_id, filter = detailSortField, sort = detailSortOrder) => {
    try {
      let url = await fetch(`${INVOICE_DETAIL_API}/by-invoice/${invoice_id}?sort_field=${sortField}&sort_order=${sortOrder}`);
      const data = await url.json();
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
  }, [filters, page, pageSize, search,  sortField, sortOrder]);

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

  const handleDefaultFeeChange = (idx, field, value) => {
    setDefaultFees(prev =>
      prev.map((fee, i) =>
        i === idx ? { ...fee, [field]: field === "checked" ? value : Number(value) } : fee
      )
    );
  };

  const handleSubmitInvoice = async () => {
    const payload = {
      ...form,
      room_id: form.room_id ? parseInt(form.room_id) : null,
      total_amount: 0, // Không nhập tay khi thêm mới
      is_paid: form.is_paid,
      month: form.month ? form.month + "-01" : "",
    };
    try {
      let invoiceId;
      if (editingInvoice) {
        // Sửa hóa đơn
        const res = await fetch(`${INVOICE_API}/${editingInvoice.invoice_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        invoiceId = data.invoice_id || data.id;
        toast.success("✏️ Sửa hóa đơn thành công!");
      } else {
        // Thêm mới hóa đơn
        const res = await fetch(INVOICE_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        invoiceId = data.invoice_id || data.id;
        toast.success("✅ Thêm hóa đơn thành công!");

        // --- Tự động thêm chi tiết hóa đơn điện ---
        try {
          const elecRes = await fetch(`${ELECTRICITY_API}/latest?room_id=${form.room_id}`);
          if (elecRes.ok) {
            const elecData = await elecRes.json();
            if (elecData && elecData.meter_id && elecData.month?.slice(0, 7) <= form.month) {
              await fetch(INVOICE_DETAIL_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  invoice_id: invoiceId,
                  fee_type: "Electricity",
                  electricity_meter_id: elecData.meter_id,
                  amount: elecData.total_amount,
                  note: `Tiền điện tháng ${elecData.month?.slice(0, 7)}`,
                }),
              });
            }
          }
        } catch {}

        // --- Tự động thêm chi tiết hóa đơn nước ---
        try {
          const waterRes = await fetch(`${WATER_API}/latest?room_id=${form.room_id}`);
          if (waterRes.ok) {
            const waterData = await waterRes.json();
            if (waterData && waterData.meter_id && waterData.month?.slice(0, 7) <= form.month) {
              await fetch(INVOICE_DETAIL_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  invoice_id: invoiceId,
                  fee_type: "Water",
                  water_meter_id: waterData.meter_id,
                  amount: waterData.total_amount,
                  note: `Tiền nước tháng ${waterData.month?.slice(0, 7)}`,
                }),
              });
            }
          }
        } catch {}

        // Thêm các chi tiết hóa đơn mặc định khác (Trash, Wifi, ...)
        for (const fee of defaultFees) {
          if (fee.checked && !["Electricity", "Water"].includes(fee.key)) {
            await fetch(INVOICE_DETAIL_API, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                invoice_id: invoiceId,
                fee_type: fee.key,
                amount: fee.amount,
                note: `Phí ${fee.label} tháng ${form.month}`,
              }),
            });
          }
        }
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

  const handleAddDetail = async () => {
    setDetailForm({
      invoice_id: selectedInvoiceId,
      electricity_meter_id: "",
      water_meter_id: "",
      fee_type: "",
      amount: "",
      note: "",
    });
    setEditingDetail(null);
    setDetailUnsaved(false);
    await fetchInvoices();
    // Nếu đã biết phòng, lấy danh sách hóa đơn điện của phòng đó
    const invoice = invoices.find(inv => inv.invoice_id === selectedInvoiceId);
    if (invoice && invoice.room_id) {
      try {
        const res = await fetch(`${ELECTRICITY_API}?room_id=${invoice.room_id}`);
        const data = await res.json();
        setElectricityMeters(Array.isArray(data) ? data : []);
      } catch {
        setElectricityMeters([]);
      }
    } else {
      setElectricityMeters([]);
    }
  };

  const handleEditDetail = (detail) => {
    setDetailForm({
      invoice_id: detail.invoice_id,
      electricity_meter_id: detail.electricity_meter_id || "",
      water_meter_id: detail.water_meter_id || "",
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
      // 👉 Load lại bảng hóa đơn chính
      await fetchInvoices();
    } catch (err) {
      toast.error("Xóa chi tiết hóa đơn thất bại! " + err.message);
    }
  };

  const handleSubmitDetail = async () => {
    const payload = {
      ...detailForm,
      invoice_id: selectedInvoiceId,
      electricity_meter_id: detailForm.electricity_meter_id ? parseInt(detailForm.electricity_meter_id) : null,
      water_meter_id: detailForm.water_meter_id ? parseInt(detailForm.water_meter_id) : null,
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
      // 👉 Load lại bảng hóa đơn chính
      await fetchInvoices();
    } catch (err) {
      toast.error("Lưu chi tiết hóa đơn thất bại! " + err.message);
    }
  };

  const handleDetailFormChange = async (field, value) => {
    // Nếu chọn electricity_meter_id (hóa đơn điện) thì tự động lấy total_amount
    if (field === "electricity_meter_id" && detailForm.fee_type === "Electricity") {
      const meter = electricityMeters.find(m => String(m.electricity_meter_id) === String(value));
      setDetailForm((prev) => ({
        ...prev,
        electricity_meter_id: value,
        amount: meter ? meter.total_amount : "",
      }));
      setDetailUnsaved(true);
      return;
    }

    setDetailForm((prev) => ({ ...prev, [field]: value }));
    setDetailUnsaved(true);

    // Nếu chọn loại phí là "Electricity", load lại danh sách công tơ điện nếu chưa có
    if (field === "fee_type" && value === "Electricity") {
      const invoice = invoices.find(inv => inv.invoice_id === selectedInvoiceId);
      if (invoice && invoice.room_id) {
        try {
          const res = await fetch(`${ELECTRICITY_API}?room_id=${invoice.room_id}`);
          const data = await res.json();
          setElectricityMeters(Array.isArray(data) ? data : []);
        } catch {
          setElectricityMeters([]);
        }
      }
    }

    // Nếu chọn loại phí là "Water", load lại danh sách công tơ nước nếu chưa có
    if (field === "fee_type" && value === "Water") {
      const invoice = invoices.find(inv => inv.invoice_id === selectedInvoiceId);
      if (invoice && invoice.room_id) {
        try {
          const res = await fetch(`${WATER_API}?room_id=${invoice.room_id}`);
          const data = await res.json();
          setWaterMeters(Array.isArray(data) ? data : []);
        } catch {
          setWaterMeters([]);
        }
      }
    }
  };

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportingInvoice, setExportingInvoice] = useState(null);
  const [exportType, setExportType] = useState("docx");
  const [customFileName, setCustomFileName] = useState("");
  const [loadingExport, setLoadingExport] = useState(false);

  const handleExportInvoice = (invoice) => {
    setExportingInvoice(invoice);
    const room = rooms.find(r => r.room_id === invoice.room_id);
    const safeRoomNumber = room
      ? room.room_number.replace(/[^a-zA-Z0-9]/g, "_")
      : "invoice";
    setCustomFileName(`${safeRoomNumber}_invoice`);
    setExportType("docx");
    setShowExportModal(true);
  };

  const doExportInvoice = async () => {
    if (!exportingInvoice) return;
    setLoadingExport(true);
    try {
      const fileExt = exportType === "pdf" ? "pdf" : "docx";
      const fileName = customFileName ? `${customFileName}.${fileExt}` : `invoice.${fileExt}`;
      const res = await fetch(
        `${INVOICE_EXPORT_API}/${exportingInvoice.invoice_id}?file_type=${exportType}&file_name=${encodeURIComponent(fileName)}`
      );
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("✅ Đã xuất hóa đơn!");
      setShowExportModal(false);
      await fetchInvoices();
    } catch (err) {
      toast.error("Xuất hóa đơn thất bại! " + err.message);
    }
    setLoadingExport(false);
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
            onLoad={fetchInvoices}
            onSearch={setSearch}
            onExportCSV={exportCSV}
            onExportJSON={exportJSON}
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
            fetchRooms();
            }}
            onSort={(field, order) => {
              
              setSortField(field);
              setSortOrder(order);
              // Gọi lại fetchInvoices với sort
              fetchInvoices(field, order);
            }}
          sortField={sortField}
          sortOrder={sortOrder}
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
                {/* Ẩn textbox Số tiền khi thêm mới */}
                {editingInvoice && (
                  <div className="col-md-6">
                    <label className="form-label">Số tiền (VND)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={
                        detailForm.amount
                          ? new Intl.NumberFormat("vi-VN").format(detailForm.amount)
                          : ""
                      }
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\./g, "").replace(/,/g, "");
                        const numericValue = rawValue ? parseInt(rawValue, 10) : "";
                        handleDetailFormChange("amount", numericValue);
                      }}
                      required
                    />
                  </div>
                )}
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
              {/* Thêm các phí mặc định */}
              <div className="row g-3">
              <div className="col-12">
              <label className="form-label">Các loại phí mặc định</label>
              <div className="row">
                {defaultFees.map((fee, idx) => (
                  <div className="col-md-4 mb-2" key={fee.key}>
                    <div className="form-check d-flex align-items-center">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={fee.checked}
                        onChange={e => handleDefaultFeeChange(idx, "checked", e.target.checked)}
                        id={`fee-${fee.key}`}
                      />
                      <label className="form-check-label ms-2 me-2" htmlFor={`fee-${fee.key}`}>
                        {fee.label}
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: "100px" }}
                        value={fee.amount}
                        min={0}
                        onChange={e => handleDefaultFeeChange(idx, "amount", e.target.value)}
                        disabled={!fee.checked}
                      />
                    </div>
                  </div>
                ))}
              </div>
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
          <Table 
          columns={detailColumns} 
          data={invoiceDetails}
          page={pageDetail}
          pageSize={pageSizeDetail}
          totalRecords={totalRecordsDetail}
          onPageChange={(newPage) => setPageDetail(newPage)}
          onPageSizeChange={(size) => {
            setPageSizeDetail(size);
            setPageDetail(1);
          }}
          onSort={(field, order) => {
            setDetailSortField(field);
            setDetailSortOrder(order);
          }}
          detailSortField={detailSortField}
          detailSortOrder={detailSortOrder}
          />

          {(editingDetail !== null || detailForm.invoice_id) && (
            <form className="mt-3">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Loại phí</label>
                  <select
                    className="form-select"
                    value={detailForm.fee_type}
                    onChange={async (e) => {
                      const newFeeType = e.target.value;
                      handleDetailFormChange("fee_type", newFeeType);

                      if (newFeeType === "Electricity") {
                        // Gọi API lấy danh sách công tơ điện
                        try {
                          const res = await fetch(`${API_URL}/electricity-meters?room_id=${selectedRoomId}`);
                          const data = await res.json();
                          setElectricityMeters(Array.isArray(data) ? data : []);
                        } catch (err) {
                          console.error("Lỗi tải công tơ điện:", err);
                          setElectricityMeters([]);
                        }
                      } else {
                        // Reset electricity_meter_id nếu không phải điện
                        handleDetailFormChange("electricity_meter_id", null);
                      }
                    }}
                    required
                  >
                    <option value="">-- Chọn loại phí --</option>
                    {FEE_TYPES.map((ft) => (
                      <option key={ft.value} value={ft.value}>
                        {ft.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Nếu chọn Electricity thì hiện combobox chọn công tơ */}
                  {detailForm.fee_type === "Electricity" && (
                    <div className="col-md-6">
                      <label className="form-label">Hóa đơn điện</label>
                      <select
                        className="form-select"
                        value={detailForm.electricity_meter_id || ""}
                        onChange={(e) => handleDetailFormChange("electricity_meter_id", e.target.value)}
                        required
                      >
                        <option value="">-- Chọn hóa đơn điện --</option>
                        {electricityMeters.map((meter) => (
                          <option key={meter.meter_id} value={meter.meter_id}>
                            {`Tháng ${meter.month?.slice(0, 7)} | Cũ: ${meter.old_reading} | Mới: ${meter.new_reading}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                {/* Nếu chọn Water thì hiện combobox chọn công tơ nước */}
                {detailForm.fee_type === "Water" && (
                    <div className="col-md-6">
                      <label className="form-label">Hóa đơn nước</label>
                      <select
                        className="form-select"
                        value={detailForm.water_meter_id || ""}
                        onChange={(e) => handleDetailFormChange("water_meter_id", e.target.value)}
                        required
                      >
                        <option value="">-- Chọn hóa đơn nước --</option>
                        {waterMeters.map((meter) => (
                          <option key={meter.meter_id} value={meter.meter_id}>
                            {`Tháng ${meter.month?.slice(0, 7)} | Cũ: ${meter.old_reading} | Mới: ${meter.new_reading}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                <div className="col-md-6">
                  <label className="form-label">Số tiền (VND)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={
                      detailForm.amount
                        ? new Intl.NumberFormat("vi-VN").format(detailForm.amount)
                        : ""
                    }
                    onChange={(e) => {
                      // Bỏ dấu chấm phân cách trước khi lưu
                      const rawValue = e.target.value.replace(/\./g, "").replace(/,/g, "");
                      const numericValue = rawValue ? parseInt(rawValue, 10) : "";
                      handleDetailFormChange("amount", numericValue);
                    }}
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
                        electricity_meter_id: "",
                        water_meter_id: "",
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

        <Modal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="Tạo/Xuất hóa đơn"
          showConfirm
          onConfirm={doExportInvoice}
          confirmText={loadingExport ? "Đang xuất..." : "Tải về"}
          confirmDisabled={loadingExport}
        >
          <div className="mb-3">
            <label className="form-label">Chọn loại file</label>
            <div className="d-flex gap-3">
              <div>
                <input
                  type="radio"
                  id="docx"
                  name="exportType"
                  value="docx"
                  checked={exportType === "docx"}
                  onChange={() => setExportType("docx")}
                />
                <label htmlFor="docx" className="ms-2">Word (.docx)</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="pdf"
                  name="exportType"
                  value="pdf"
                  checked={exportType === "pdf"}
                  onChange={() => setExportType("pdf")}
                />
                <label htmlFor="pdf" className="ms-2">PDF (.pdf)</label>
              </div>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Tên file</label>
            <input
              type="text"
              className="form-control"
              value={customFileName}
              onChange={e => setCustomFileName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
              placeholder="Tên file không dấu, không khoảng trắng"
            />
            <div className="form-text">
              File sẽ được lưu với tên: <b>{customFileName}.{exportType}</b>
            </div>
          </div>
        </Modal>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
}