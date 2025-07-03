import React, { useState, useEffect, useMemo } from "react";

// Hỗ trợ lấy giá trị lồng như "room_type.type_name"
const getNestedValue = (obj, path) =>
  path.split(".").reduce((acc, part) => acc && acc[part], obj);

export default function Table({ columns, data, rowsPerPage = 10 }) {
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    const keyword = search.toLowerCase();
    const filtered = data.filter((row) =>
      columns.some((col) =>
        String(getNestedValue(row, col.accessor) ?? "")
          .toLowerCase()
          .includes(keyword)
      )
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [search, data, columns]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = getNestedValue(a, sortConfig.key);
      const valB = getNestedValue(b, sortConfig.key);

      if (typeof valA === "number" && typeof valB === "number") {
        return sortConfig.direction === "asc" ? valA - valB : valB - valA;
      }
      return sortConfig.direction === "asc"
        ? String(valA ?? "").localeCompare(String(valB ?? ""))
        : String(valB ?? "").localeCompare(String(valA ?? ""));
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  // Trạng thái đặc biệt cho ảnh khi không có dữ liệu hoặc tìm không ra
  const isInitialEmpty = data.length === 0;
  const isFilteredEmpty = data.length > 0 && filteredData.length === 0;

  return (
    <div>
      {/* Tìm kiếm */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Trường hợp không có dữ liệu */}
      {(isInitialEmpty || isFilteredEmpty) ? (
        <div className="text-center py-5">
          <img
            src={isFilteredEmpty ? "/images/no-result.png" : "/images/no-data.png"}
            alt="No data"
            style={{ maxWidth: "300px", opacity: 0.7 }}
          />
          <p className="text-muted mt-3">
            {isFilteredEmpty ? "Không tìm thấy kết quả phù hợp." : "Chưa có dữ liệu nào."}
          </p>
        </div>
      ) : (
        <>
          {/* Bảng dữ liệu */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-primary">
                <tr>
                  <th className="text-center">STT</th>
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
                {paginatedData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="text-center">
                      {(currentPage - 1) * rowsPerPage + rowIndex + 1}
                    </td>
                    {columns.map((col, i) => {
                      const value = getNestedValue(row, col.accessor);
                      return (
                        <td key={i} className="text-center">
                          {col.render ? col.render(value, row) : value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
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
        </>
      )}
    </div>
  );
}
