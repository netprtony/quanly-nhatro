import React, { useState, useEffect } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import AdvancedFilters from "/src/components/AdvancedFilters.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TypeRooms() {
  const [typeRooms, setTypeRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // API base URL
  const API_URL = "http://localhost:8000/roomtypes";
  // Fetch room types from backend
  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể lấy dữ liệu loại phòng");
        return res.json();
      })
      .then((data) => setTypeRooms(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [form, setForm] = useState({
    type_name: "",
    price_per_month: "",
    description: "",
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);

  // Advanced filters
  const [filters, setFilters] = useState([]);

  const fieldOptions = [
    { value: "room_type_id", label: "Mã loại", type: "number" },
    { value: "type_name", label: "Tên loại", type: "string" },
    { value: "price_per_month", label: "Giá phòng", type: "number" },
    { value: "description", label: "Mô tả", type: "string" },
  ];

  const getValueByPath = (obj, path) =>
    path.split(".").reduce((o, p) => (o ? o[p] : undefined), obj);

  const evaluateFilter = (f, item) => {
    const raw = getValueByPath(item, f.field);
    if (raw === undefined || raw === null) return false;

    const maybeNum = Number(raw);
    const targetNum = Number(f.value);
    const isNumeric = !isNaN(maybeNum) && !isNaN(targetNum);

    if (isNumeric) {
      switch (f.operator) {
        case ">":
          return maybeNum > targetNum;
        case "<":
          return maybeNum < targetNum;
        case ">=":
          return maybeNum >= targetNum;
        case "<=":
          return maybeNum <= targetNum;
        case "=":
          return maybeNum === targetNum;
        case "~": {
          const diff = Math.abs(maybeNum - targetNum);
          const tol = Math.max(1, Math.abs(targetNum) * 0.1);
          return diff <= tol;
        }
        default:
          return false;
      }
    }

    const rawStr = String(raw).toLowerCase();
    const valStr = String(f.value).toLowerCase();
    if (f.operator === "=") return rawStr === valStr;
    if (f.operator === "~") return rawStr.includes(valStr);
    return false;
  };

  const applyFilters = (list) => {
    if (!filters || filters.length === 0) return list;
    return list.filter((item) => filters.every((f) => evaluateFilter(f, item)));
  };

  const columns = [
    { label: "Mã loại", accessor: "room_type_id" },
    { label: "Tên loại phòng", accessor: "type_name" },
    {
      label: "Giá phòng",
      accessor: "price_per_month",
      render: (value) =>
        typeof value === "number"
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value)
          : "N/A",
    },
    { label: "Mô tả", accessor: "description" },
    {
      label: "Thao tác",
      accessor: "actions",
      render: (_, type) => (
        <div className="d-flex gap-2 justify-content-center">
          <button
            className="btn btn-sm btn-warning"
            onClick={() => handleEdit(type)}
          >
            Sửa
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(type.room_type_id)}
          >
            Xóa
          </button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setForm({
      type_name: "",
      price_per_month: "",
      description: "",
    });
    setEditingType(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (type) => {
    setForm({
      type_name: type.type_name,
      price_per_month: type.price_per_month,
      description: type.description || "",
    });
    setEditingType(type);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (typeId) => {
    setTypeToDelete(typeId);
    setShowConfirmDelete(true);
  };

  // Delete room type
  const confirmDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/${typeToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Xóa loại phòng thất bại");
      setTypeRooms((prev) =>
        prev.filter((t) => t.room_type_id !== typeToDelete)
      );
      toast.success("🗑️ Xóa loại phòng thành công!");
    } catch (err) {
      toast.error(err.message);
    }
    setShowConfirmDelete(false);
    setTypeToDelete(null);
  };

  // Add or update room type
  const handleSubmitType = async () => {
    try {
      let res, data;
      if (editingType) {
        // Update
        res = await fetch(`${API_URL}/${editingType.room_type_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Cập nhật loại phòng thất bại");
        data = await res.json();
        setTypeRooms((prev) =>
          prev.map((t) =>
            t.room_type_id === editingType.room_type_id ? data : t
          )
        );
        toast.success("✏️ Cập nhật loại phòng thành công!");
      } else {
        // Add
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Thêm loại phòng thất bại");
        data = await res.json();
        setTypeRooms((prev) => [...prev, data]);
        toast.success("✅ Thêm loại phòng thành công!");
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.message);
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
        <h3 className="mb-3">🏷️ Danh sách loại phòng</h3>
        <button className="btn btn-success mb-3" onClick={handleAdd}>
          ➕ Thêm loại phòng
        </button>

        {/* Advanced Filters */}
        <AdvancedFilters
          fieldOptions={fieldOptions}
          filters={filters}
          setFilters={setFilters}
        />

        {loading ? (
          <div>Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-danger">{error}</div>
        ) : (
          <Table columns={columns} data={applyFilters(typeRooms)} />
        )}

        {/* Modal Thêm / Sửa */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingType ? "✏️ Chỉnh sửa loại phòng" : "➕ Thêm loại phòng"}
          showConfirm
          onConfirm={handleSubmitType}
        >
          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Tên loại phòng</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.type_name}
                  onChange={(e) =>
                    handleFormChange("type_name", e.target.value)
                  }
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Giá phòng (VND)</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.price_per_month}
                  onChange={(e) =>
                    handleFormChange("price_per_month", parseInt(e.target.value) || 0)
                  }
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">Mô tả</label>
                <textarea
                  className="form-control"
                  value={form.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  rows={3}
                />
              </div>
            </div>
          </form>
        </Modal>

        {/* Modal xác nhận xóa */}
        <ModalConfirm
          isOpen={showConfirmDelete}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa loại phòng này không?"
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