import React, { useState, useEffect } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import AdvancedFilters from "/src/components/AdvancedFilters.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RESERVATION_URL = "http://localhost:8000/reservations";
const USERS_API = "http://localhost:8000/accounts";
const ROOMS_API = "http://localhost:8000/rooms";

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [form, setForm] = useState({
    contact_phone: "",
    room_id: "",
    user_id: "",
    status: "Pending",
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);

  // Phân trang, lọc, tìm kiếm
  const [filters, setFilters] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortField, setSortField] = useState();
  const [sortOrder, setSortOrder] = useState();

  // Các trường lọc nâng cao
  const fieldOptions = [
    { value: "reservation_id", label: "Mã đặt phòng", type: "number" },
    { value: "contact_phone", label: "Số điện thoại", type: "string" },
    { value: "room_id", label: "Phòng", type: "number" },
    { value: "status", label: "Trạng thái", type: "string" },
  ];

  // Lấy danh sách đặt phòng từ API (có phân trang + filter nâng cao)
  const fetchReservations = async (field = sortField, order = sortOrder) => {
    try {
      let url = `${RESERVATION_URL}?page=${page}&page_size=${pageSize}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (field) url += `&sort_field=${field}`;
      if (order) url += `&sort_order=${order}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      let res, data;
      if (filters.length > 0) {
        res = await fetch(url.replace(RESERVATION_URL, RESERVATION_URL + "/filter"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters, sort_field: field, sort_order: order }),
        });
      } else {
        res = await fetch(url);
      }
      data = await res.json();
      setReservations(Array.isArray(data.items) ? data.items : []);
      setTotalRecords(data.total || 0);
    } catch (err) {
      toast.error("Không thể tải danh sách đặt phòng!");
      setReservations([]);
      setTotalRecords(0);
    }
  };

  // Lấy danh sách người dùng cho combobox
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${USERS_API}?page=1&page_size=200`);
      const data = await res.json();
      setUsers(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      toast.error("Không thể tải danh sách người dùng!");
      setUsers([]);
    }
  };

  // Lấy danh sách phòng
  const fetchRooms = async () => {
    try {
      const res = await fetch(`${ROOMS_API}?page=1&page_size=200`);
      const data = await res.json();
      setRooms(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      toast.error("Không thể tải danh sách phòng!");
      setRooms([]);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchUsers();
    fetchRooms();
    // eslint-disable-next-line
  }, [filters, page, pageSize, search]);

  // Thêm mới đặt phòng
  const createReservation = async () => {
    try {
      const payload = {
        ...form,
        room_id: form.room_id ? parseInt(form.room_id) : null,
        user_id: form.user_id ? parseInt(form.user_id) : null,
      };
      const res = await fetch(RESERVATION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchReservations();
      toast.success("✅ Thêm đặt phòng thành công!");
      setShowModal(false);
    } catch (err) {
      toast.error("Thêm đặt phòng thất bại! " + err.message);
    }
  };

  // Sửa đặt phòng
  const updateReservation = async () => {
    try {
      const payload = {
        ...form,
        room_id: form.room_id ? parseInt(form.room_id) : null,
        user_id: form.user_id ? parseInt(form.user_id) : null,
      };
      const res = await fetch(`${RESERVATION_URL}/${editingReservation.reservation_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchReservations();
      toast.success("✏️ Cập nhật đặt phòng thành công!");
      setShowModal(false);
    } catch (err) {
      toast.error("Cập nhật đặt phòng thất bại! " + err.message);
    }
  };

  // Xóa đặt phòng
  const deleteReservation = async () => {
    try {
      const res = await fetch(`${RESERVATION_URL}/${reservationToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchReservations();
      toast.success("🗑️ Xóa đặt phòng thành công!");
      setShowConfirmDelete(false);
      setReservationToDelete(null);
    } catch (err) {
      toast.error("Xóa đặt phòng thất bại! " + err.message);
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (reservations.length === 0) return;
    const headers = Object.keys(reservations[0]);
    const csv = [
      headers.join(","),
      ...reservations.map((row) =>
        headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reservations.csv";
    a.click();
  };

  // Export JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(reservations, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reservations.json";
    a.click();
  };

  const columns = [
    { label: "ID", accessor: "reservation_id" },
    { label: "Số điện thoại", accessor: "contact_phone" },
    {
      label: "Phòng",
      accessor: "room_id",
      render: (room_id) => {
        const room = rooms.find((r) => r.room_id === room_id);
        return room ? room.room_number : room_id;
      },
    },
    { label: "Trạng thái", accessor: "status" },
    { label: "Ngày tạo", accessor: "created_at" },
    {
      label: "Thao tác",
      accessor: "actions",
      render: (_, reservation) => (
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(reservation)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(reservation.reservation_id)}>Xóa</button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setForm({
      contact_phone: "",
      room_id: "",
      user_id: "",
      status: "Pending",
    });
    setEditingReservation(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (reservation) => {
    setForm({
      contact_phone: reservation.contact_phone || "",
      room_id: reservation.room_id ? String(reservation.room_id) : "",
      user_id: reservation.user_id ? String(reservation.user_id) : "",
      status: reservation.status || "Pending",
    });
    setEditingReservation(reservation);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (reservationId) => {
    setReservationToDelete(reservationId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    deleteReservation();
  };

  const handleSubmitReservation = () => {
    if (editingReservation) {
      updateReservation();
    } else {
      createReservation();
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
          <h3 className="mb-0">📝 Danh sách đặt phòng</h3>
          <button className="btn btn-success" onClick={handleAdd}>
            ➕ Thêm đặt phòng
          </button>
        </div>

        <div className="mb-3">
          <AdvancedFilters
            fieldOptions={fieldOptions}
            filters={filters}
            onAddFilter={(f) => setFilters((prev) => [...prev, f])}
            onRemoveFilter={(i) => setFilters((prev) => prev.filter((_, idx) => idx !== i))}
            compact
            onLoad={fetchReservations}
            onSearch={setSearch}
            onExportCSV={exportCSV}
            onExportJSON={exportJSON}
          />
        </div>

        <Table
          columns={columns}
          data={reservations}
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
            fetchReservations(field, order);
          }}
          sortField={sortField}
          sortOrder={sortOrder}
        />

        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingReservation ? "✏️ Chỉnh sửa đặt phòng" : "➕ Thêm đặt phòng"}
          showConfirm
          onConfirm={handleSubmitReservation}
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
                <label className="form-label">Số điện thoại</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.contact_phone}
                  onChange={(e) => handleFormChange("contact_phone", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Người dùng (ID)</label>
                <select
                  className="form-select"
                  value={form.user_id}
                  onChange={(e) => handleFormChange("user_id", e.target.value)}
                  required
                >
                  <option value="">-- Chọn người dùng --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => handleFormChange("status", e.target.value)}
                  required
                >
                  <option value="Pending">Chờ xác nhận</option>
                  <option value="Confirmed">Đã xác nhận</option>
                  <option value="Cancelled">Đã hủy</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>

        <ModalConfirm
          isOpen={showConfirmDelete}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa đặt phòng này không?"
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