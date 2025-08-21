import React from "react";

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
}) {
  // Đảm bảo data luôn là mảng
  const safeData = Array.isArray(data) ? data : [];

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const isInitialEmpty = !safeData || safeData.length === 0;

  return (
    <div>
      {/* Tìm kiếm nếu cần */}
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

      {/* Trường hợp không có dữ liệu */}
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
          {/* Bảng dữ liệu */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-primary">
                <tr>
                  <th className="text-center">STT</th>
                  {columns.map((col, i) => (
                    <th key={i} className="text-center">
                      {col.label}
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
