import React, { useState } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Payments() {
  // Mock dữ liệu thanh toán
  const [payments, setPayments] = useState([
    {
      payment_id: 1,
      invoice_id: 1,
      tenant_name: "Nguyễn Văn D",
      amount: 2500000,
      date: "2024-06-02",
      method: "Chuyển khoản",
      note: "Thanh toán tiền phòng tháng 6",
    },
    {
      payment_id: 2,
      invoice_id: 2,
      tenant_name: "Trần Thị E",
      amount: 3500000,
      date: "2024-06-03",
      method: "Tiền mặt",
      note: "Thanh toán tiền phòng tháng 6",
    },
    {
      payment_id: 3,
      invoice_id: 3,
      tenant_name: "Lê Văn F",
      amount: 1800000,
      date: "2024-05-03",
      method: "Chuyển khoản",
      note: "Thanh toán tiền phòng tháng 5",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [form, setForm] = useState({
    invoice_id: "",
    tenant_name: "",
    amount: "",
    date: "",
    method: "Chuyển khoản",
    note: "",
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  const columns = [
    { label: "ID", accessor: "payment_id" },
    { label: "Phiếu thu", accessor: "invoice_id" },
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
    { label: "Ngày thanh toán", accessor: "date" },
    { label: "Phương thức", accessor: "method" },
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

  const handleAdd = () => {
    setForm({
      invoice_id: "",
      tenant_name: "",
      amount: "",
      date: "",
      method: "Chuyển khoản",
      note: "",
    });
    setEditingPayment(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (payment) => {
    setForm({
      invoice_id: payment.invoice_id,
      tenant_name: payment.tenant_name,
      amount: payment.amount,
      date: payment.date,
      method: payment.method,
      note: payment.note,
    });
    setEditingPayment(payment);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (paymentId) => {
    setPaymentToDelete(paymentId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    setPayments((prev) => prev.filter((p) => p.payment_id !== paymentToDelete));
    toast.success("🗑️ Xóa thanh toán thành công!");
    setShowConfirmDelete(false);
    setPaymentToDelete(null);
  };

  const handleSubmitPayment = () => {
    if (editingPayment) {
      // Sửa thanh toán
      setPayments((prev) =>
        prev.map((p) =>
          p.payment_id === editingPayment.payment_id
            ? { ...p, ...form }
            : p
        )
      );
      toast.success("✏️ Cập nhật thanh toán thành công!");
    } else {
      // Thêm thanh toán mới
      setPayments((prev) => [
        ...prev,
        {
          ...form,
          payment_id: prev.length ? Math.max(...prev.map((p) => p.payment_id)) + 1 : 1,
        },
      ]);
      toast.success("✅ Thêm thanh toán thành công!");
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
        <h3 className="mb-3">💳 Danh sách thanh toán</h3>
        <button className="btn btn-success mb-3" onClick={handleAdd}>
          ➕ Thêm thanh toán
        </button>

        <Table columns={columns} data={payments} />

        {/* Modal Thêm / Sửa */}
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
                <input
                  type="text"
                  className="form-control"
                  value={form.invoice_id}
                  onChange={(e) => handleFormChange("invoice_id", e.target.value)}
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
                <label className="form-label">Ngày thanh toán</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.date}
                  onChange={(e) => handleFormChange("date", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phương thức</label>
                <select
                  className="form-select"
                  value={form.method}
                  onChange={(e) => handleFormChange("method", e.target.value)}
                  required
                >
                  <option value="Chuyển khoản">Chuyển khoản</option>
                  <option value="Tiền mặt">Tiền mặt</option>
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
          message="Bạn có chắc chắn muốn xóa thanh toán này không?"
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