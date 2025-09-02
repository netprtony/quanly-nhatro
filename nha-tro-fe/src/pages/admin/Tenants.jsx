import React, { useState, useEffect, useRef } from "react";
import Table from "/src/components/Table.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import AdvancedFilters from "/src/components/AdvancedFilters.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TENANT_URL = "http://localhost:8000/tenants/";
const CCCD_UPLOAD_API = "http://localhost:8000/tenants/upload-cccd";
const USER_API = "http://localhost:8000/accounts/";

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [form, setForm] = useState({
    tenant_id: "",
    full_name: "",
    phone_number: "",
    address: "",
    gender: "Other",
    date_of_birth: "",
    id_card_front_path: "",
    id_card_back_path: "",
    is_rent: true,
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [viewCCCD, setViewCCCD] = useState(null); // {src, alt}

  // Bộ lọc nâng cao, tìm kiếm, phân trang, sort
  const [filters, setFilters] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(200);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortField, setSortField] = useState();
  const [sortOrder, setSortOrder] = useState();
  const [userAll, setUserAll] = useState([]);
  // Cấu hình bộ lọc nâng cao
  const fieldOptions = [
    { value: "tenant_id", label: "Mã khách thuê", type: "string" },
    { value: "full_name", label: "Họ tên", type: "string" },
    { value: "phone_number", label: "Số điện thoại", type: "string" },
    { value: "address", label: "Địa chỉ", type: "string" },
    { value: "gender", label: "Giới tính", type: "string" },
    { value: "date_of_birth", label: "Ngày sinh", type: "string" },
    { value: "is_rent", label: "Trạng thái", type: "boolean" },
  ];

  const columns = [
    { label: "ID", accessor: "tenant_id" },
    { label: "Họ tên", accessor: "full_name" },
    { label: "Số điện thoại", accessor: "phone_number" },
    { label: "Giới tính", accessor: "gender",
      render: (value) => {
        if (value === "Male") return "Nam";
        if (value === "Female") return "Nữ";
        return "Khác";
      },
    },
    { label: "Ngày sinh", accessor: "date_of_birth", render: (value) => value ? new Date(value).toLocaleDateString("vi-VN") : "" },
    { label: "Địa chỉ", accessor: "address" },
    // Thêm cột hình ảnh CCCD
    {
      label: "Ảnh CCCD",
      accessor: "id_card_front_path",
      render: (value, tenant) => (
        <div className="d-flex gap-2">
          {tenant.id_card_front_path && (
            <img
              src={tenant.id_card_front_path.startsWith("/") ? tenant.id_card_front_path : `/cccd/${tenant.id_card_front_path}`}
              alt="CCCD trước"
              style={{ width: 40, height: 28, objectFit: "cover", borderRadius: 4, cursor: "pointer", border: "1px solid #eee" }}
              onClick={() => setViewCCCD({
                src: tenant.id_card_front_path.startsWith("/") ? tenant.id_card_front_path : `/cccd/${tenant.id_card_front_path}`,
                alt: `CCCD mặt trước - ${tenant.full_name}`
              })}
            />
          )}
          {tenant.id_card_back_path && (
            <img
              src={tenant.id_card_back_path.startsWith("/") ? tenant.id_card_back_path : `/cccd/${tenant.id_card_back_path}`}
              alt="CCCD sau"
              style={{ width: 40, height: 28, objectFit: "cover", borderRadius: 4, cursor: "pointer", border: "1px solid #eee" }}
              onClick={() => setViewCCCD({
                src: tenant.id_card_back_path.startsWith("/") ? tenant.id_card_back_path : `/cccd/${tenant.id_card_back_path}`,
                alt: `CCCD mặt sau - ${tenant.full_name}`
              })}
            />
          )}
        </div>
      ),
    },
    {
      label: "Trạng thái thuê",
      accessor: "tenant_status",
      render: (value) => {
        if (value === "Active") return <span className="badge bg-success">Đang thuê</span>;
        if (value === "Terminated") return <span className="badge bg-danger">Đã kết thúc</span>;
        return <span className="badge bg-secondary">Chờ duyệt</span>;
      },
    },
    {
      label: "Thao tác",
      accessor: "actions",
      render: (_, tenant) => (
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(tenant)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(tenant.tenant_id)}>Xóa</button>
        </div>
      ),
    },
  ];

  // Lấy danh sách tenants từ API (phân trang, lọc, sort)
  const fetchTenants = async (field = sortField, order = sortOrder) => {
    try {
      let url = `${TENANT_URL}?page=${page}&page_size=${pageSize}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (field) url += `&sort_field=${field}`;
      if (order) url += `&sort_order=${order}`;
      let res, data;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      if (filters.length > 0) {
        res = await fetch(url.replace(TENANT_URL, TENANT_URL + "filter"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters, sort_field: field, sort_order: order }),
        });
      } else {
        res = await fetch(url);
      }

      data = await res.json();
      setTenants(Array.isArray(data.items) ? data.items : []);
      setTotalRecords(data.total || 0);
    } catch (err) {
      toast.error("Không thể tải danh sách khách thuê!");
      setTenants([]);
      setTotalRecords(0);
    }
  };
  

  useEffect(() => {
    fetchTenants();
    // eslint-disable-next-line
  }, [filters, page, pageSize, search, sortField, sortOrder]);

  // Export CSV
  const exportCSV = () => {
    if (tenants.length === 0) return;
    const headers = Object.keys(tenants[0]);
    const csv = [
      headers.join(","),
      ...tenants.map((row) =>
        headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tenants.csv";
    a.click();
  };

  // Export JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(tenants, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tenants.json";
    a.click();
  };

  // Hàm upload file CCCD, trả về đường dẫn ảnh
  const uploadCCCD = async (file, tenantId, type) => {
    if (!file || !tenantId || !type) return "";
    const formData = new FormData();
    formData.append("file", file);
    // Truyền tenant_id và loại mặt (front/back) vào query
    const res = await fetch(`${CCCD_UPLOAD_API}?tenant_id=${tenantId}_${type}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.image_path || "";
  };

  // CRUD
  const createTenant = async () => {
    try {
      let frontPath = form.id_card_front_path;
      let backPath = form.id_card_back_path;
      const tenantId = form.tenant_id;
      if (frontFile) frontPath = await uploadCCCD(frontFile, tenantId, "front");
      if (backFile) backPath = await uploadCCCD(backFile, tenantId, "back");

      const res = await fetch(TENANT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id_card_front_path: frontPath, id_card_back_path: backPath }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchTenants();
      toast.success("✅ Thêm khách thuê thành công!");
      setShowModal(false);
      setFrontFile(null);
      setBackFile(null);
    } catch (err) {
      toast.error("Thêm khách thuê thất bại! " + err.message);
    }
  };

  const updateTenant = async () => {
    try {
      let frontPath = form.id_card_front_path;
      let backPath = form.id_card_back_path;
      const tenantId = form.tenant_id;
      if (frontFile) frontPath = await uploadCCCD(frontFile, tenantId, "front");
      if (backFile) backPath = await uploadCCCD(backFile, tenantId, "back");

      const res = await fetch(`${TENANT_URL}${editingTenant.tenant_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id_card_front_path: frontPath, id_card_back_path: backPath }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchTenants();
      toast.success("✏️ Cập nhật khách thuê thành công!");
      setShowModal(false);
      setFrontFile(null);
      setBackFile(null);
    } catch (err) {
      toast.error("Cập nhật khách thuê thất bại! " + err.message);
    }
  };

  const deleteTenant = async () => {
    try {
      const res = await fetch(`${TENANT_URL}${tenantToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchTenants();
      toast.success("🗑️ Xóa khách thuê thành công!");
      setShowConfirmDelete(false);
      setTenantToDelete(null);
    } catch (err) {
      toast.error("Xóa khách thuê thất bại! " + err.message);
    }
  };

  const handleAdd = () => {
    setForm({
      tenant_id: "",
      full_name: "",
      phone_number: "",
      address: "",
      gender: "Other",
      date_of_birth: "",
      id_card_front_path: "",
      id_card_back_path: "",
      is_rent: true,
    });
    setEditingTenant(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (tenant) => {
    setForm({
      tenant_id: tenant.tenant_id,
      full_name: tenant.full_name,
      phone_number: tenant.phone_number || "",
      address: tenant.address || "",
      gender: tenant.gender || "Other",
      date_of_birth: tenant.date_of_birth || "",
      id_card_front_path: tenant.id_card_front_path || "",
      id_card_back_path: tenant.id_card_back_path || "",
      tenant_status: tenant.tenant_status || "Pending", // Sửa lại dòng này
    });
    setEditingTenant(tenant);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (tenantId) => {
    setTenantToDelete(tenantId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    deleteTenant();
  };

  const handleSubmitTenant = () => {
    if (editingTenant) {
      updateTenant();
    } else {
      createTenant();
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

  function ZoomableDraggableImage({ src, alt }) {
    const [zoomed, setZoomed] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [start, setStart] = useState({ x: 0, y: 0 });
    const [mouseDown, setMouseDown] = useState(false);
    const [moved, setMoved] = useState(false);

    const imgRef = useRef();

    const handleClick = (e) => {
      // Nếu vừa drag thì không zoom
      if (moved) {
        setMoved(false);
        return;
      }
      setZoomed(!zoomed);
      setPos({ x: 0, y: 0 });
    };

    const handleMouseDown = (e) => {
      if (!zoomed) return;
      setMouseDown(true);
      setDragging(true);
      setStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
      setMoved(false);
      document.body.style.cursor = "grabbing";
    };

    const handleMouseMove = (e) => {
      if (mouseDown && zoomed) {
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        // Nếu di chuyển đủ xa thì coi là drag, không phải click
        if (Math.abs(dx - pos.x) > 3 || Math.abs(dy - pos.y) > 3) {
          setMoved(true);
        }
        setPos({ x: dx, y: dy });
      }
    };

    const handleMouseUp = () => {
      setMouseDown(false);
      setDragging(false);
      document.body.style.cursor = "default";
    };

    useEffect(() => {
      if (mouseDown) {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
      } else {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      }
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
      // eslint-disable-next-line
    }, [mouseDown, zoomed, start, pos]);

    return (
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{
          maxWidth: zoomed ? "none" : "100%",
          maxHeight: zoomed ? "none" : "70vh",
          width: zoomed ? "auto" : "100%",
          height: zoomed ? "auto" : "auto",
          borderRadius: 12,
          border: "2px solid #eee",
          transition: "transform 0.3s",
          cursor: zoomed ? (dragging ? "grabbing" : "grab") : "zoom-in",
          transform: zoomed
            ? `scale(1.8) translate(${pos.x / 1.8}px, ${pos.y / 1.8}px)`
            : "scale(1)",
          boxShadow: zoomed ? "0 0 16px rgba(0,0,0,0.15)" : "none",
          userSelect: "none",
        }}
        draggable={false}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
      />
    );
  }

  return (
    <div className="container mt-4 position-relative">
      <div className="p-4 rounded shadow bg-white">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="mb-0">🧑‍💼 Danh sách khách thuê</h3>
          <button className="btn btn-success" onClick={handleAdd}>
            ➕ Thêm khách thuê
          </button>
        </div>

        <div className="mb-3">
          <AdvancedFilters
            fieldOptions={fieldOptions}
            filters={filters}
            onAddFilter={(f) => setFilters((prev) => [...prev, f])}
            onRemoveFilter={(i) => setFilters((prev) => prev.filter((_, idx) => idx !== i))}
            compact
            onLoad={fetchTenants}
            onSearch={setSearch}
            onExportCSV={exportCSV}
            onExportJSON={exportJSON}
          />
        </div>

        <Table
          columns={columns}
          data={tenants}
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
            fetchTenants(field, order);
          }}
          sortField={sortField}
          sortOrder={sortOrder}
        />

        {/* Modal Thêm / Sửa */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingTenant ? "✏️ Chỉnh sửa khách thuê" : "➕ Thêm khách thuê"}
          showConfirm
          onConfirm={handleSubmitTenant}
        >
          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Mã khách thuê</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.tenant_id}
                  onChange={(e) => handleFormChange("tenant_id", e.target.value)}
                  required
                  disabled={!!editingTenant}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Họ tên</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.full_name}
                  onChange={(e) => handleFormChange("full_name", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.phone_number}
                  onChange={(e) => handleFormChange("phone_number", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Địa chỉ</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Giới tính</label>
                <select
                  className="form-select"
                  value={form.gender}
                  onChange={(e) => handleFormChange("gender", e.target.value)}
                >
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Ngày sinh</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.date_of_birth ? form.date_of_birth.substring(0, 10) : ""}
                  onChange={(e) => handleFormChange("date_of_birth", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Ảnh CMND/CCCD mặt trước</label>
                {form.id_card_front_path && (
                  <div className="mb-2">
                    <img
                      src={form.id_card_front_path.startsWith("/") ? form.id_card_front_path : `/cccd/${form.id_card_front_path}`}
                      alt="CCCD trước"
                      style={{ maxWidth: "100%", maxHeight: 120, borderRadius: 8, border: "1px solid #eee" }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={e => setFrontFile(e.target.files[0])}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Ảnh CMND/CCCD mặt sau</label>
                {form.id_card_back_path && (
                  <div className="mb-2">
                    <img
                      src={form.id_card_back_path.startsWith("/") ? form.id_card_back_path : `/cccd/${form.id_card_back_path}`}
                      alt="CCCD sau"
                      style={{ maxWidth: "100%", maxHeight: 120, borderRadius: 8, border: "1px solid #eee" }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={e => setBackFile(e.target.files[0])}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Trạng thái thuê</label>
                <select
                  className="form-select"
                  value={form.tenant_status ?? "Pending"}
                  onChange={(e) => handleFormChange("tenant_status", e.target.value)}
                  required
                >
                  <option value="Active">Đang thuê</option>
                  <option value="Terminated">Đã kết thúc</option>
                  <option value="Pending">Chờ duyệt</option>
                </select>
              </div>
            </div>  
          </form>
        </Modal>

        {/* Modal xác nhận xóa */}
        <ModalConfirm
          isOpen={showConfirmDelete}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa khách thuê này không?"
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

        {/* Modal xem ảnh CCCD lớn */}
        <Modal
          isOpen={!!viewCCCD}
          onClose={() => setViewCCCD(null)}
          title={viewCCCD?.alt || "Ảnh CCCD"}
          showConfirm={false}
        >
          {viewCCCD && (
            <div style={{ textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div
                style={{
                  display: "inline-block",
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  position: "relative",
                  cursor: "grab",
                }}
              >
                <ZoomableDraggableImage src={viewCCCD.src} alt={viewCCCD.alt} />
              </div>
              <div className="mt-2 text-muted" style={{ fontSize: 14 }}>
                Nhấn vào ảnh để phóng to / thu nhỏ, giữ chuột để di chuyển khi đã zoom
              </div>
            </div>
          )}
        </Modal>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}