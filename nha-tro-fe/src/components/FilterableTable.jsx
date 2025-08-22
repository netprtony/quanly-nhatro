import React, { useState, useEffect } from "react";
import axios from "axios";
import AdvancedFilters from "./AdvancedFilters";
import Table from "./Table";
import { toast } from "react-toastify";

export default function FilterableTable({ columns, fieldOptions, apiUrl }) {
  const [filters, setFilters] = useState([]);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // 🆕 state cho sort
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.post(apiUrl, {
        page,
        page_size: pageSize,
        search,
        filters,
        sort: { field: sortField, direction: sortDirection },
      });
      setData(res.data.items || []);
      setTotalRecords(res.data.total || 0);
    } catch (err) {
      toast.error("❌ Lỗi khi tải dữ liệu!");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, filters, search, sortField, sortDirection]);

  const handleAddFilter = (f) => setFilters((prev) => [...prev, f]);
  const handleRemoveFilter = (i) =>
    setFilters((prev) => prev.filter((_, idx) => idx !== i));

  // 🆕 Xuất CSV
  const exportCSV = () => {
    if (!data.length) return toast.warn("Không có dữ liệu để xuất!");
    const header = columns.map((c) => c.label).join(",");
    const rows = data.map((row) =>
      columns.map((c) => JSON.stringify(row[c.accessor] ?? "")).join(",")
    );
    const csv = [header, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.csv";
    a.click();
  };

  // 🆕 Xuất JSON
  const exportJSON = () => {
    if (!data.length) return toast.warn("Không có dữ liệu để xuất!");
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.json";
    a.click();
  };

  return (
    <div>
      {/* Thanh tìm kiếm + nút load */}
      <div className="mb-3 d-flex gap-2">
        <input
          type="text"
          placeholder="🔍 Nhập từ khóa tìm kiếm..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="form-control"
        />
        <button
          className="btn btn-success"
          type="button"
          onClick={fetchData}
          disabled={loading}
        >
          {loading ? "⏳ Đang tải..." : "🔄 Load dữ liệu"}
        </button>
        <button className="btn btn-outline-primary" onClick={exportCSV}>
          ⬇ CSV
        </button>
        <button className="btn btn-outline-secondary" onClick={exportJSON}>
          ⬇ JSON
        </button>
      </div>

      {/* Bộ lọc nâng cao */}
      <AdvancedFilters
        fieldOptions={fieldOptions}
        filters={filters}
        onAddFilter={handleAddFilter}
        onRemoveFilter={handleRemoveFilter}
      />

      {/* Bảng */}
      <Table
        columns={columns}
        data={data}
        page={page}
        pageSize={pageSize}
        totalRecords={totalRecords}
        sortField={sortField}
        sortDirection={sortDirection}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(size) => {
          setPage(1);
          setPageSize(size);
        }}
        onSortChange={(field, dir) => {
          setSortField(field);
          setSortDirection(dir);
        }}
      />
    </div>
  );
}
