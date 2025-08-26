import React, { useEffect, useState } from "react";
import Table from "../../components/Table";
import AdvancedFilters from "../../components/AdvancedFilters";

const PAYMENT_API = "http://localhost:8000/payments";
const TENANT_API = "http://localhost:8000/tenants/from-user/";

const fieldOptions = [
  { label: "Mã hóa đơn", value: "invoice_id" },
  { label: "Số phòng", value: "room_number" },
  { label: "Tên khách", value: "tenant_name" },
  { label: "Số tiền", value: "paid_amount" },
  { label: "Ngày thanh toán", value: "payment_date" },
  { label: "Phương thức", value: "payment_method" },
];

export default function History_Payment() {
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState([]);
  const [search, setSearch] = useState("");
  const [tenantId, setTenantId] = useState(null);

  useEffect(() => {
    // Lấy tenant_id từ user đang đăng nhập
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.id) {
      fetch(`${TENANT_API}${user.id}`)
        .then(res => res.json())
        .then(data => setTenantId(data.tenant_id))
        .catch(() => setTenantId(null));
    }
  }, []);

  useEffect(() => {
    if (!tenantId) return;
    let url = `${PAYMENT_API}?page=${page}&page_size=${pageSize}&tenant_id=${tenantId}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    // Nếu có bộ lọc nâng cao, có thể truyền thêm vào url hoặc body (tùy backend)
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setPayments(data.items || []);
        setTotal(data.total || 0);
      });
  }, [page, pageSize, filters, search, tenantId]);

  const columns = [
    { label: "Mã hóa đơn", accessor: "invoice_id" },
    { label: "Số phòng", accessor: "room_number" },
    { label: "Tên khách", accessor: "tenant_name" },
    {
      label: "Số tiền",
      accessor: "paid_amount",
      render: (value) =>
        value
          ? value.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
          : "N/A",
    },
    {
      label: "Ngày thanh toán",
      accessor: "payment_date",
      render: (value) =>
        value ? new Date(value).toLocaleDateString("vi-VN") : "",
    },
    { label: "Phương thức", accessor: "payment_method" },
    { label: "Ghi chú", accessor: "note" },
  ];

  const exportCSV = () => { /* ... */ };
  const exportJSON = () => { /* ... */ };

  return (
    <div className="container py-4">
      <h3 className="mb-4 fw-bold text-center">Lịch sử thanh toán</h3>
      <AdvancedFilters
        fieldOptions={fieldOptions}
        filters={filters}
        onAddFilter={f => setFilters(prev => [...prev, f])}
        onRemoveFilter={i => setFilters(prev => prev.filter((_, idx) => idx !== i))}
        onSearch={setSearch}
        onExportCSV={exportCSV}
        onExportJSON={exportJSON}
      />
      <Table
        columns={columns}
        data={payments}
        page={page}
        pageSize={pageSize}
        totalRecords={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}