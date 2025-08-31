import React, { useEffect, useState } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import AdvancedFilters from "/src/components/AdvancedFilters.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ROOM_URL = "http://localhost:8000/rooms/";
const ROOMTYPE_URL = "http://localhost:8000/roomtypes/";
const ROOM_IMAGE_URL = "http://localhost:8000/room-images/";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState({
    room_id: "",
    room_number: "",
    floor_number: "",
    max_occupants: "",
    room_type_id: "",
    is_available: true,
    description: "",
  });

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomImages, setRoomImages] = useState([]);
  const [editingImage, setEditingImage] = useState(null);
  const [imageForm, setImageForm] = useState({ image_path: "", room_id: "" });
  const [imageToDelete, setImageToDelete] = useState(null);
  const [showImageConfirmDelete, setShowImageConfirmDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  // Bộ lọc nâng cao, tìm kiếm, phân trang, sort
  const [filters, setFilters] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortField, setSortField] = useState();
  const [sortOrder, setSortOrder] = useState();

  // Cấu hình bộ lọc nâng cao
  const fieldOptions = [
    { value: "room_id", label: "Mã phòng", type: "number" },
    { value: "room_number", label: "Số phòng", type: "string" },
    { value: "floor_number", label: "Tầng", type: "number" },
    { value: "max_occupants", label: "Số người tối đa", type: "number" },
    { value: "room_type_id", label: "Loại phòng", type: "number" },
    { value: "is_available", label: "Còn trống", type: "boolean" },
  ];

  const columns = [
    { label: "Mã phòng", accessor: "room_id" },
    { label: "Số phòng", accessor: "room_number" },
    { label: "Tầng", accessor: "floor_number" },
    { label: "Số người tối đa", accessor: "max_occupants" },
    {
      label: "Còn trống",
      accessor: "is_available",
      render: (value) => (value ? 
        <span className="badge bg-success">Trống</span>
        : <span className="badge bg-danger">Có người</span>),
    },
    {
      label: "Loại phòng",
      accessor: "room_type",
      render: (_, room) =>
        room.room_type
          ? room.room_type.type_name
          : (roomTypes.find((t) => t.room_type_id === room.room_type_id)?.type_name || room.room_type_id),
    },
    {
      label: "Giá phòng",
      accessor: "room_type",
      render: (_, room) =>
        room.room_type && typeof room.room_type.price_per_month === "number"
          ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(room.room_type.price_per_month)
          : (
              roomTypes.find((t) => t.room_type_id === room.room_type_id)?.price_per_month
                ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                    roomTypes.find((t) => t.room_type_id === room.room_type_id).price_per_month
                  )
                : "N/A"
            ),
    },
    {
      label: "Số hình",
      accessor: "image_count",
      render: (value) => value ?? 0,
    },
    {
      label: "Thao tác",
      accessor: "actions",
      render: (_, room) => (
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-sm btn-info" onClick={() => handleViewImages(room)}>Xem ảnh</button>
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(room)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(room.room_id)}>Xóa</button>
        </div>
      ),
    },
  ];

  // Lấy danh sách phòng từ API (phân trang, lọc, sort)
  const fetchRooms = async (field = sortField, order = sortOrder) => {
    try {
      let url = `${ROOM_URL}?page=${page}&page_size=${pageSize}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (field) url += `&sort_field=${field}`;
      if (order) url += `&sort_order=${order}`;
      let res, data;
      if (filters.length > 0) {
        res = await fetch(url.replace(ROOM_URL, ROOM_URL + "filter"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters, sort_field: field, sort_order: order }),
        });
      } else {
        res = await fetch(url);
      }
      data = await res.json();
      setRooms(Array.isArray(data.items) ? data.items : []);
      setTotalRecords(data.total || 0);
    } catch (err) {
      toast.error("❌ Lỗi khi lấy danh sách phòng!");
      setRooms([]);
      setTotalRecords(0);
    }
  };

  // Lấy danh sách loại phòng cho combobox
  const fetchRoomTypes = async () => {
    try {
      const res = await fetch(`${ROOMTYPE_URL}?page=1&page_size=200`);
      const data = await res.json();
      // Đảm bảo lấy đúng mảng loại phòng từ API mới
      setRoomTypes(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      toast.error("❌ Lỗi khi lấy loại phòng!");
      setRoomTypes([]);
    }
  };

  

  const fetchRoomImages = async (room_id) => {
    try {
      const res = await fetch(`${ROOM_IMAGE_URL}?room_id=${room_id}`);
      const data = await res.json();
      setRoomImages(data);
    } catch {
      setRoomImages([]);
    }
  };

  const handleViewImages = (room) => {
    setSelectedRoom(room);
    fetchRoomImages(room.room_id);
    setShowImageModal(true);
    setEditingImage(null);
    setImageForm({ image_path: "", room_id: room.room_id });
  };

  const handleAddImage = async () => {
    setEditingImage(null);
    setImageForm({ image_path: "", room_id: selectedRoom.room_id });
    setShowUploadModal(true);
  };

  const handleEditImage = async (img) => {
    setEditingImage(img);
    setImageForm({ image_path: img.image_path, room_id: img.room_id });
    setShowUploadModal(true);
  };

  const handleDeleteImage = async (imgId) => {
    setImageToDelete(imgId);
    setShowImageConfirmDelete(true);
  };

  const confirmDeleteImage = async () => {
    try {
      await fetch(`${ROOM_IMAGE_URL}${imageToDelete}`, { method: "DELETE" });
      fetchRoomImages(selectedRoom.room_id);
      await fetchRooms(); // cập nhật số hình
      toast.success("🗑️ Xóa ảnh thành công!");
    } catch (err) {
      toast.error("Xóa ảnh thất bại!");
    }
    setShowImageConfirmDelete(false);
    setImageToDelete(null);
  };

  const handleSubmitImage = async () => {
    try {
      if (editingImage) {
        await fetch(`${ROOM_IMAGE_URL}${editingImage.image_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(imageForm),
        });
        toast.success("✏️ Sửa ảnh thành công!");
      } else {
        await fetch(ROOM_IMAGE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(imageForm),
        });
        toast.success("✅ Thêm ảnh thành công!");
      }
      fetchRoomImages(selectedRoom.room_id);
      await fetchRooms(); // cập nhật số hình
      setEditingImage(null);
      setImageForm({ image_path: "", room_id: selectedRoom.room_id });
    } catch (err) {
      toast.error("Lưu ảnh thất bại!");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/room-images/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setImageForm((prev) => ({ ...prev, image_path: data.image_path }));
      toast.success("Ảnh đã được tải lên!");
    } catch (err) {
      toast.error("Tải ảnh thất bại!");
    }
    setUploading(false);
  };

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
    // eslint-disable-next-line
  }, [filters, page, pageSize, search, sortField, sortOrder]);

  // Export CSV
  const exportCSV = () => {
    if (rooms.length === 0) return;
    const headers = Object.keys(rooms[0]);
    const csv = [
      headers.join(","),
      ...rooms.map((row) =>
        headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rooms.csv";
    a.click();
  };

  // Export JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(rooms, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rooms.json";
    a.click();
  };

  // CRUD
  const createRoom = async () => {
    try {
      const res = await fetch(ROOM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchRooms();
      toast.success("✅ Thêm phòng thành công!");
      setShowModal(false);
    } catch (err) {
      toast.error("Thêm phòng thất bại! " + err.message);
    }
  };

  const updateRoom = async () => {
    try {
      const res = await fetch(`${ROOM_URL}${editingRoom.room_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errMsg = await res.text();
        if (errMsg.includes("hợp đồng thuê hoạt động") || errMsg.includes("Chỉ được phép sửa")) {
          toast.error("Không thể sửa phòng: phòng đang có khách thuê hoặc hợp đồng hoạt động!");
        } else {
          toast.error("Cập nhật phòng thất bại! " + errMsg);
        }
        return;
      }
      await fetchRooms();
      toast.success("✏️ Cập nhật phòng thành công!");
      setShowModal(false);
    } catch (err) {
      toast.error("Cập nhật phòng thất bại! " + err.message);
    }
  };

  const deleteRoom = async () => {
    try {
      const res = await fetch(`${ROOM_URL}${roomToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errMsg = await res.text();
        if (errMsg.includes("hợp đồng thuê hoạt động")) {
          toast.error("Không thể xóa phòng: phòng đang có khách thuê hoặc hợp đồng hoạt động!");
        } else {
          toast.error("Xóa phòng thất bại! " + errMsg);
        }
        return;
      }
      await fetchRooms();
      toast.success("🗑️ Xóa phòng thành công!");
      setShowConfirmDelete(false);
      setRoomToDelete(null);
    } catch (err) {
      toast.error("Xóa phòng thất bại! " + err.message);
    }
  };

  const handleAdd = () => {
    setForm({
      room_id: "",
      room_number: "",
      floor_number: "",
      max_occupants: "",
      room_type_id: "",
      is_available: true,
      description: "",
    });
    setEditingRoom(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (room) => {
    setForm({
      room_id: room.room_id,
      room_number: room.room_number,
      floor_number: room.floor_number,
      max_occupants: room.max_occupants,
      room_type_id: room.room_type_id || (room.room_type && room.room_type.room_type_id) || "",
      is_available: room.is_available,
      description: room.description || "",
    });
    setEditingRoom(room);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (roomId) => {
    setRoomToDelete(roomId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    deleteRoom();
  };

  const handleSubmitRoom = () => {
    if (editingRoom) {
      updateRoom();
    } else {
      createRoom();
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
          <h3 className="mb-0">📦 Danh sách phòng</h3>
          <button className="btn btn-success" onClick={handleAdd}>
            ➕ Thêm phòng
          </button>
        </div>

        <div className="mb-3">
          <AdvancedFilters
            fieldOptions={fieldOptions}
            filters={filters}
            onAddFilter={(f) => setFilters((prev) => [...prev, f])}
            onRemoveFilter={(i) => setFilters((prev) => prev.filter((_, idx) => idx !== i))}
            compact
            onLoad={fetchRooms}
            onSearch={setSearch}
            onExportCSV={exportCSV}
            onExportJSON={exportJSON}
          />
        </div>

        <Table
          columns={columns}
          data={rooms}
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
            fetchRooms(field, order);
          }}
          sortField={sortField}
          sortOrder={sortOrder}
        />

        {/* Modal Thêm / Sửa */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingRoom ? "✏️ Chỉnh sửa phòng" : "➕ Thêm phòng"}
          showConfirm
          onConfirm={handleSubmitRoom}
        >
          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Số phòng</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.room_number}
                  onChange={(e) => handleFormChange("room_number", e.target.value)}
                  required
                  disabled={!!editingRoom}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Tầng</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.floor_number}
                  onChange={(e) => handleFormChange("floor_number", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Số người tối đa</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.max_occupants}
                  onChange={(e) => handleFormChange("max_occupants", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Loại phòng</label>
                <select
                  className="form-select"
                  value={form.room_type_id}
                  onChange={(e) => handleFormChange("room_type_id", e.target.value)}
                  required
                >
                  <option value="">-- Chọn loại phòng --</option>
                  {roomTypes.map((type) => (
                    <option key={type.room_type_id} value={type.room_type_id}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Mô tả</label>
                <textarea
                  className="form-control"
                  value={form.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isAvailable"
                    checked={form.is_available}
                    onChange={(e) => handleFormChange("is_available", e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="isAvailable">
                    Còn trống
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
          message="Bạn có chắc chắn muốn xóa phòng này không?"
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

        {/* Modal xem ảnh phòng */}
        <Modal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          title={`Ảnh phòng ${selectedRoom?.room_number || ""}`}
          showConfirm={false}
        >
          <div>
            <div className="mb-2 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Danh sách ảnh phòng</h5>
              <button className="btn btn-success btn-sm" onClick={() => setShowUploadModal(true)}>
                ➕ Thêm ảnh
              </button>
            </div>
            <div className="row">
              {roomImages.map((img) => (
                <div className="col-md-6 mb-3" key={img.image_id}>
                  <div className="card">
                    <img
                      src={img.image_path}
                      alt={`Phòng ${selectedRoom?.room_number}`}
                      className="card-img-top"
                      style={{ height: "350px", objectFit: "cover", width: "100%" }} // tăng chiều cao
                    />
                    <div className="card-body p-2 d-flex justify-content-between">
                      <button className="btn btn-warning btn-sm" onClick={() => handleEditImage(img)}>
                        Sửa
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteImage(img.image_id)}>
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {roomImages.length === 0 && <div className="col-12 text-center text-muted">Chưa có ảnh phòng</div>}
            </div>
            {(editingImage !== null || imageForm.image_path) && (
              <form className="mt-3">
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label">Chọn ảnh</label>
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => setShowUploadModal(true)}
                      disabled={uploading}
                    >
                      Chọn file ảnh
                    </button>
                    {imageForm.image_path && (
                      <div className="mt-2">
                        <img
                          src={imageForm.image_path}
                          alt="Preview"
                          style={{ width: "100%", maxHeight: "180px", objectFit: "cover", marginBottom: 4 }}
                        />
                        <div className="small text-muted">Đường dẫn: {imageForm.image_path}</div>
                      </div>
                    )}
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmitImage}
                      disabled={!imageForm.image_path || uploading}
                    >
                      {editingImage ? "Lưu chỉnh sửa" : "Thêm mới"}
                    </button>
                    {editingImage && (
                      <button
                        type="button"
                        className="btn btn-secondary ms-2"
                        onClick={() => {
                          setEditingImage(null);
                          setImageForm({ image_path: "", room_id: selectedRoom.room_id });
                        }}
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}
            <ModalConfirm
              isOpen={showImageConfirmDelete}
              title="Xác nhận xóa"
              message="Bạn có chắc chắn muốn xóa ảnh này không?"
              confirmText="Xóa"
              cancelText="Hủy"
              onConfirm={confirmDeleteImage}
              onClose={() => setShowImageConfirmDelete(false)}
            />
          </div>
        </Modal>

        {/* Modal chọn và tải ảnh lên */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title={editingImage ? "Sửa ảnh phòng" : "Thêm ảnh phòng"}
          showConfirm={false}
        >
          <form>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Chọn ảnh</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                {imageForm.image_path && (
                  <div className="mt-2">
                    <img
                      src={imageForm.image_path}
                      alt="Preview"
                      style={{ width: "100%", maxHeight: "350px", objectFit: "cover", marginBottom: 4 }} // tăng chiều cao
                    />
                    <div className="small text-muted">Đường dẫn: {imageForm.image_path}</div>
                  </div>
                )}
              </div>
              <div className="col-12 d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={async () => {
                    await handleSubmitImage();
                    setShowUploadModal(false);
                  }}
                  disabled={!imageForm.image_path || uploading}
                >
                  {editingImage ? "Lưu chỉnh sửa" : "Thêm mới"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() => {
                    setEditingImage(null);
                    setImageForm({ image_path: "", room_id: selectedRoom.room_id });
                    setShowUploadModal(false);
                  }}
                >
                  Hủy
                </button>
              </div>
            </div>
          </form>
        </Modal>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}