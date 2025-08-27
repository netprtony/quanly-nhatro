import React, { useEffect, useState } from "react";
import Table from "../../components/Table";

const TENANT_API = "http://localhost:8000/tenants/from-user/";
const INVOICE_API = "http://localhost:8000/invoices/";
const ROOMS_API = "http://localhost:8000/rooms";

const fieldOptions = [
  { label: "Mã hóa đơn", value: "invoice_id" },
  { label: "Phòng", value: "room_id" },
  { label: "Tháng", value: "month" },
  { label: "Số tiền", value: "total_amount" },
  { label: "Trạng thái", value: "is_paid" },
  { label: "Ngày tạo", value: "created_at" },
];

export default function Invoice() {
  const [tenantId, setTenantId] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Lấy tenant_id từ user đang đăng nhập
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.id) {
      fetch(`${TENANT_API}${user.id}`)
        .then((res) => res.json())
        .then((data) => setTenantId(data.tenant_id))
        .catch(() => setTenantId(null));
    }
  }, []);

  // Lấy danh sách phòng để map room_id -> room_number
  useEffect(() => {
    fetch(`${ROOMS_API}?page=1&page_size=200`)
      .then((res) => res.json())
      .then((data) => setRooms(data.items || []));
  }, []);

  // Load danh sách hóa đơn
  useEffect(() => {
    if (!tenantId) return;
    let url = `${INVOICE_API}?page=${page}&page_size=${pageSize}&sort_order=${sortOrder}&tenant_id=${tenantId}`;
    if (sortField) url += `&sort_field=${sortField}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setInvoices(data.items || []);
        setTotal(data.total || 0);
      });
  }, [tenantId, page, pageSize, sortField, sortOrder, search]);

  const columns = [
    { label: "Mã hóa đơn", accessor: "invoice_id" },
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
          ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
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
  ];

  const handleSort = (field, order) => {
    setSortField(field);
    setSortOrder(order);
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4 fw-bold text-center">Danh sách hóa đơn của bạn</h3>
      <Table
        columns={columns}
        data={invoices}
        page={page}
        pageSize={pageSize}
        totalRecords={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSort={handleSort}
        sortField={sortField}
        sortOrder={sortOrder}
      />
    </div>
  );
}