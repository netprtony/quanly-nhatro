import React, { useState, useEffect } from "react";

export default function Table({ columns, data, onRowClick, rowsPerPage = 5 }) {
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    const keyword = search.toLowerCase();
    const filtered = data.filter((row) =>
      columns.some((col) =>
        String(row[col.accessor]).toLowerCase().includes(keyword)
      )
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [search, data, columns]);

  const toggleRow = (row) => {
    const exists = selectedRows.includes(row);
    setSelectedRows((prev) =>
      exists ? prev.filter((r) => r !== row) : [...prev, row]
    );
  };

  const isChecked = (row) => selectedRows.includes(row);

  // Sorting function
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      if (typeof valA === "number" && typeof valB === "number") {
        return sortConfig.direction === "asc" ? valA - valB : valB - valA;
      } else {
        return sortConfig.direction === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      }
    });
    return sorted;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  return (
    <div>
      {/* Search */}
      <div className="mb-2">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-primary">
            <tr>
              <th className="text-center">#</th>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="text-center cursor-pointer"
                  onClick={() => handleSort(col.accessor)}
                  style={{ userSelect: "none" }}
                >
                  {col.label}
                  {sortConfig.key === col.accessor && (
                    <span className="ms-1">
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center text-muted">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className="cursor-pointer"
                >
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={isChecked(row)}
                      onChange={() => toggleRow(row)}
                    />
                  </td>
                  {columns.map((col, i) => (
                    <td key={i} className="text-center">
                      {row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-2">
        <small>
          Trang {currentPage} / {totalPages || 1}
        </small>
        <div className="btn-group">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            ◀
          </button>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
