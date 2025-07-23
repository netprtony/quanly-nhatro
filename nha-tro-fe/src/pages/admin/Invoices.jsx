import React, { useState } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Invoices() {
  // Mock dữ liệu phiếu thu
  const [invoices, setInvoices] = useState([
    {
      invoice_id: 1,
      contract_id: 1,
      tenant_name: "Nguyễn Văn D",
      amount: 2500000,
      date: "2024-06-01",
      status: "Đã thanh toán",
      note: "Tiền phòng tháng 6",
    },
    {
      invoice_id: 2,
      contract_id: 2,
      tenant_name: "Trần Thị E",
      amount: 3500000,
      date: "2024-06-01",
      status: "Chưa thanh toán",
      note: "Tiền phòng tháng 6",
    },
    {
      invoice_id: 3,
      contract_id: 3,
      tenant_name: "Lê Văn F",
      amount: 1800000,
      date: "2024-05-01",
      status: "Đã thanh toán",
      note: "Tiền phòng tháng 5",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [form, setForm] = useState({
    contract_id: "",
    tenant_name: "",
    amount: "",
    date: "",
    status: "Chưa thanh toán",
    note: "",
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const columns = [
    { label: "ID", accessor: "invoice_id" },
    { label: "Hợp đồng", accessor: "contract_id" },
    { label: "Khách thuê", accessor: "tenant_name" },
    {
      label: "Số tiền",
      accessor: "amount",
      render: (value) =>
        typeof value === "number"
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value)
          : "N/A",
    },
    { label: "Ngày thu", accessor: "date" },
    { label: "Trạng thái", accessor: "status" },
    { label: "Ghi chú", accessor: "note" },
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

  const handleAdd = () => {
    setForm({
      contract_id: "",
      tenant_name: "",
      amount: "",
      date: "",
      status: "Chưa thanh toán",
      note: "",
    });
    setEditingInvoice(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (invoice) => {
    setForm({
      contract_id: invoice.contract_id,
      tenant_name: invoice.tenant_name,
      amount: invoice.amount,
      date: invoice.date,
      status: invoice.status,
      note: invoice.note,
    });
    setEditingInvoice(invoice);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (invoiceId) => {
    setInvoiceToDelete(invoiceId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    setInvoices((prev) => prev.filter((i) => i.invoice_id !== invoiceToDelete));
    toast.success("🗑️ Xóa phiếu thu thành công!");
    setShowConfirmDelete(false);
    setInvoiceToDelete(null);
  };

  const handleSubmitInvoice = () => {
    if (editingInvoice) {
      // Sửa phiếu thu
      setInvoices((prev) =>
        prev.map((i) =>
          i.invoice_id === editingInvoice.invoice_id
            ? { ...i, ...form }
            : i
        )
      );
      toast.success("✏️ Cập nhật phiếu thu thành công!");
    } else {
      // Thêm phiếu thu mới
      setInvoices((prev) => [
        ...prev,
        {
          ...form,
          invoice_id: prev.length ? Math.max(...prev.map((i) => i.invoice_id)) + 1 : 1,
        },
      ]);
      toast.success("✅ Thêm phiếu thu thành công!");
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
        <h3 className="mb-3">💵 Danh sách phiếu thu</h3>
        <button className="btn btn-success mb-3" onClick={handleAdd}>
          ➕ Thêm phiếu thu
        </button>

        <Table columns={columns} data={invoices} />

        {/* Modal Thêm / Sửa */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingInvoice ? "✏️ Chỉnh sửa phiếu thu" : "➕ Thêm phiếu thu"}
          showConfirm
          onConfirm={handleSubmitInvoice}
        >
          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Hợp đồng</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.contract_id}
                  onChange={(e) => handleFormChange("contract_id", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Khách thuê</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.tenant_name}
                  onChange={(e) => handleFormChange("tenant_name", e.target.value)}
                  required
                />
              </div>
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
              <div className="col-md-6">
                <label className="form-label">Ngày thu</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.date}
                  onChange={(e) => handleFormChange("date", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => handleFormChange("status", e.target.value)}
                  required
                >
                  <option value="Đã thanh toán">Đã thanh toán</option>
                  <option value="Chưa thanh toán">Chưa thanh toán</option>
                </select>
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

        {/* Modal xác nhận xóa */}
        <ModalConfirm
          isOpen={showConfirmDelete}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa phiếu thu này không?"
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