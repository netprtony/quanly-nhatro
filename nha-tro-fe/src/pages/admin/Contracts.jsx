import React, { useState } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Contracts() {
  // Mock dữ liệu hợp đồng
  const [contracts, setContracts] = useState([
    {
      contract_id: 1,
      room_number: "101",
      tenant_name: "Nguyễn Văn D",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      deposit: 2000000,
      is_active: true,
    },
    {
      contract_id: 2,
      room_number: "202",
      tenant_name: "Trần Thị E",
      start_date: "2024-03-01",
      end_date: "2024-09-30",
      deposit: 1500000,
      is_active: true,
    },
    {
      contract_id: 3,
      room_number: "303",
      tenant_name: "Lê Văn F",
      start_date: "2023-05-01",
      end_date: "2024-04-30",
      deposit: 1800000,
      is_active: false,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [form, setForm] = useState({
    room_number: "",
    tenant_name: "",
    start_date: "",
    end_date: "",
    deposit: "",
    is_active: true,
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);

  const columns = [
    { label: "ID", accessor: "contract_id" },
    { label: "Phòng", accessor: "room_number" },
    { label: "Khách thuê", accessor: "tenant_name" },
    { label: "Ngày bắt đầu", accessor: "start_date" },
    { label: "Ngày kết thúc", accessor: "end_date" },
    {
      label: "Tiền cọc",
      accessor: "deposit",
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
      accessor: "is_active",
      render: (value) => (value ? "✅ Hiệu lực" : "❌ Hết hạn"),
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
      room_number: "",
      tenant_name: "",
      start_date: "",
      end_date: "",
      deposit: "",
      is_active: true,
    });
    setEditingContract(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (contract) => {
    setForm({
      room_number: contract.room_number,
      tenant_name: contract.tenant_name,
      start_date: contract.start_date,
      end_date: contract.end_date,
      deposit: contract.deposit,
      is_active: contract.is_active,
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
    setContracts((prev) => prev.filter((c) => c.contract_id !== contractToDelete));
    toast.success("🗑️ Xóa hợp đồng thành công!");
    setShowConfirmDelete(false);
    setContractToDelete(null);
  };

  const handleSubmitContract = () => {
    if (editingContract) {
      // Sửa hợp đồng
      setContracts((prev) =>
        prev.map((c) =>
          c.contract_id === editingContract.contract_id
            ? { ...c, ...form }
            : c
        )
      );
      toast.success("✏️ Cập nhật hợp đồng thành công!");
    } else {
      // Thêm hợp đồng mới
      setContracts((prev) => [
        ...prev,
        {
          ...form,
          contract_id: prev.length ? Math.max(...prev.map((c) => c.contract_id)) + 1 : 1,
        },
      ]);
      toast.success("✅ Thêm hợp đồng thành công!");
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
        <h3 className="mb-3">📄 Danh sách hợp đồng</h3>
        <button className="btn btn-success mb-3" onClick={handleAdd}>
          ➕ Thêm hợp đồng
        </button>

        <Table columns={columns} data={contracts} />

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
                <input
                  type="text"
                  className="form-control"
                  value={form.room_number}
                  onChange={(e) => handleFormChange("room_number", e.target.value)}
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
                  value={form.deposit}
                  onChange={(e) => handleFormChange("deposit", parseInt(e.target.value) || 0)}
                  required
                />
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
                    Hiệu lực
                  </label>
                </div>
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