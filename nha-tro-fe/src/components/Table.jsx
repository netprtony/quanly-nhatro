import React, { useState, useRef } from "react";

// Hỗ trợ lấy giá trị lồng như "room_type.type_name"
const getNestedValue = (obj, path) =>
  path.split(".").reduce((acc, part) => acc && acc[part], obj);

export default function Table({
  columns,
  data,
  page = 1,
  pageSize = 10,
  totalRecords = 0,
  onPageChange,
  onPageSizeChange,
  showSearch = false,
  onSort,
  sortField,
  sortOrder,
}) {
  const safeData = Array.isArray(data) ? data : [];
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const isInitialEmpty = !safeData || safeData.length === 0;

  // State lưu width của cột
  const [colWidths, setColWidths] = useState({});

  const tableRef = useRef(null);

  const handleSort = (field) => {
    if (onSort) {
      let order = "asc";
      if (sortField === field && sortOrder === "asc") order = "desc";
      onSort(field, order);
    }
  };

  // Xử lý resize cột
  const startResize = (e, accessor) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth =
      tableRef.current.querySelector(`th[data-accessor="${accessor}"]`)
        ?.offsetWidth || 100;

    const doDrag = (moveEvent) => {
      const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
      setColWidths((prev) => ({
        ...prev,
        [accessor]: newWidth,
      }));
    };

    const stopDrag = () => {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  return (
    <div>
      {showSearch && (
        <div className="mb-3">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="form-control"
            disabled
          />
        </div>
      )}

      {isInitialEmpty ? (
        <div className="text-center py-5">
          <img
            src="/images/no-data.png"
            alt="No data"
            style={{ maxWidth: "300px", opacity: 0.7 }}
          />
          <p className="text-muted mt-3">Chưa có dữ liệu nào.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive" style={{ overflowX: "auto" }}>
            <table
              className="table table-bordered table-hover align-middle"
              ref={tableRef}
            >
              <thead className="table-primary">
                <tr>
                  <th className="text-center" style={{ width: 50 }}>
                    STT
                  </th>
                  {columns.map((col, i) => (
                    <th
                      key={i}
                      data-accessor={col.accessor}
                      className="text-center position-relative"
                      style={{
                        cursor: col.accessor ? "pointer" : "default",
                        width: colWidths[col.accessor] || "auto",
                      }}
                      onClick={() => col.accessor && handleSort(col.accessor)}
                    >
                      {col.label}
                      {col.accessor && (
                        <span style={{ marginLeft: 4 }}>
                          {sortField === col.accessor
                            ? sortOrder === "asc"
                              ? " ▲"
                              : " ▼"
                            : ""}
                        </span>
                      )}

                      {/* Thanh kéo resize */}
                      <div
                        onMouseDown={(e) => startResize(e, col.accessor)}
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          width: "5px",
                          height: "100%",
                          cursor: "col-resize",
                          userSelect: "none",
                        }}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {safeData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="text-center">
                      {(page - 1) * pageSize + rowIndex + 1}
                    </td>
                    {columns.map((col, i) => {
                      const value = getNestedValue(row, col.accessor);
                      return (
                        <td
                          key={i}
                          className="text-center"
                          style={{ width: colWidths[col.accessor] || "auto" }}
                        >
                          {col.render ? col.render(value, row) : value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-2">
            <small>
              Trang {page} / {totalPages}
            </small>
            <div className="btn-group">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => onPageChange && onPageChange(page - 1)}
                disabled={page === 1}
              >
                ◀
              </button>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => onPageChange && onPageChange(page + 1)}
                disabled={page >= totalPages}
              >
                ▶
              </button>
            </div>
            <div>
              <label className="me-2">Số bản ghi/trang:</label>
              <select
                value={pageSize}
                onChange={(e) =>
                  onPageSizeChange && onPageSizeChange(Number(e.target.value))
                }
                className="form-select d-inline-block w-auto"
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
