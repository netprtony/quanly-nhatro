import React, { useEffect, useState } from "react";
import Table from "../../components/Table";

const TENANT_API = "http://localhost:8000/tenants/from-user/";
const INVOICE_API = "http://localhost:8000/invoices/";
const ROOMS_API = "http://localhost:8000/rooms";
const INVOICE_DETAIL_API = "http://localhost:8000/invoice-details/by-invoice/";

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
  const [detailsCache, setDetailsCache] = useState({});

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

  // Hàm render collapse cho từng dòng
  const renderCollapse = (row) => {
    const invoiceId = row.invoice_id;
    const details = detailsCache[invoiceId];

    // Nếu chưa có dữ liệu chi tiết, gọi API
    if (details === undefined) {
      // Chỉ gọi API khi collapse mở
      fetch(`${INVOICE_DETAIL_API}${invoiceId}`)
        .then((res) => res.json())
        .then((data) => {
          setDetailsCache((prev) => ({ ...prev, [invoiceId]: data }));
        })
        .catch(() => {
          setDetailsCache((prev) => ({ ...prev, [invoiceId]: null }));
        });
      return <div>Đang tải chi tiết hóa đơn...</div>;
    }

    // Nếu không có dữ liệu chi tiết
    if (!details || (Array.isArray(details) && details.length === 0)) {
      return <div className="text-muted">Không có chi tiết hóa đơn.</div>;
    }

    // Hiển thị chi tiết hóa đơn (theo mẫu dữ liệu mới)
    return (
      <div>
        <h6 className="fw-bold mb-2">Chi tiết hóa đơn</h6>
        <table className="table table-sm table-bordered">
          <thead>
            <tr>
              <th>Loại phí</th>
              <th>Số tiền</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {details.map((item, idx) => (
              <tr key={item.detail_id || idx}>
                <td>{item.fee_type}</td>
                <td>
                  {item.amount?.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </td>
                <td>{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

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
        renderCollapse={renderCollapse}
      />
    </div>
  );
}