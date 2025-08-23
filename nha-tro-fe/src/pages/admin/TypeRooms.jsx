import React, { useState, useEffect } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import AdvancedFilters from "/src/components/AdvancedFilters.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:8000/roomtypes";

export default function TypeRooms() {
  const [typeRooms, setTypeRooms] = useState([]);
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

  // Bộ lọc nâng cao, tìm kiếm, phân trang, sort
  const [filters, setFilters] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortField, setSortField] = useState();
  const [sortOrder, setSortOrder] = useState();

  const fieldOptions = [
    { value: "room_type_id", label: "Mã loại", type: "number" },
    { value: "type_name", label: "Tên loại", type: "string" },
    { value: "price_per_month", label: "Giá phòng", type: "number" },
    { value: "description", label: "Mô tả", type: "string" },
  ];

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

  // Lấy danh sách loại phòng từ API (phân trang, lọc, sort)
  const fetchTypeRooms = async (field = sortField, order = sortOrder) => {
    try {
      let url = `${API_URL}?page=${page}&page_size=${pageSize}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (field) url += `&sort_field=${field}`;
      if (order) url += `&sort_order=${order}`;
      let res, data;
      if (filters.length > 0) {
        res = await fetch(url.replace(API_URL, API_URL + "/filter"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters, sort_field: field, sort_order: order }),
        });
      } else {
        res = await fetch(url);
      }
      data = await res.json();
      setTypeRooms(Array.isArray(data.items) ? data.items : []);
      setTotalRecords(data.total || 0);
    } catch (err) {
      toast.error("Không thể tải danh sách loại phòng!");
      setTypeRooms([]);
      setTotalRecords(0);
    }
  };

  useEffect(() => {
    fetchTypeRooms();
    // eslint-disable-next-line
  }, [filters, page, pageSize, search, sortField, sortOrder]);

  const exportCSV = () => {
    if (typeRooms.length === 0) return;
    const headers = Object.keys(typeRooms[0]);
    const csv = [
      headers.join(","),
      ...typeRooms.map((row) =>
        headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "roomtypes.csv";
    a.click();
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(typeRooms, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "roomtypes.json";
    a.click();
  };

  // CRUD
  const createTypeRoom = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchTypeRooms();
      toast.success("✅ Thêm loại phòng thành công!");
      setShowModal(false);
    } catch (err) {
      toast.error("Thêm loại phòng thất bại! " + err.message);
    }
  };

  const updateTypeRoom = async () => {
    try {
      const res = await fetch(`${API_URL}/${editingType.room_type_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchTypeRooms();
      toast.success("✏️ Cập nhật loại phòng thành công!");
      setShowModal(false);
    } catch (err) {
      toast.error("Cập nhật loại phòng thất bại! " + err.message);
    }
  };

  const deleteTypeRoom = async () => {
    try {
      const res = await fetch(`${API_URL}/${typeToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchTypeRooms();
      toast.success("🗑️ Xóa loại phòng thành công!");
      setShowConfirmDelete(false);
      setTypeToDelete(null);
    } catch (err) {
      toast.error("Xóa loại phòng thất bại! " + err.message);
    }
  };

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

  const confirmDelete = () => {
    deleteTypeRoom();
  };

  const handleSubmitTypeRoom = () => {
    if (editingType) {
      updateTypeRoom();
    } else {
      createTypeRoom();
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
          <h3 className="mb-3">🏷️ Danh sách loại phòng</h3>
          <button className="btn btn-success mb-3" onClick={handleAdd}>
            ➕ Thêm loại phòng
          </button>
        </div>

        <AdvancedFilters
          fieldOptions={fieldOptions}
          filters={filters}
          onAddFilter={(f) => setFilters((prev) => [...prev, f])}
          onRemoveFilter={(i) => setFilters((prev) => prev.filter((_, idx) => idx !== i))}
          compact
          onLoad={fetchTypeRooms}
          onSearch={setSearch}
          onExportCSV={exportCSV}
          onExportJSON={exportJSON}
        />

        <Table
          columns={columns}
          data={typeRooms}
          page={page}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          onSort={(field, order) => {
            setSortField(field);
            setSortOrder(order);
            fetchTypeRooms(field, order);
          }}
          sortField={sortField}
          sortOrder={sortOrder}
        />

        {/* Modal Thêm / Sửa */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingType ? "✏️ Chỉnh sửa loại phòng" : "➕ Thêm loại phòng"}
          showConfirm
          onConfirm={handleSubmitTypeRoom}
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