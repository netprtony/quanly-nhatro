import React, { useState, useRef, useEffect } from "react";

const getNestedValue = (obj, path) =>
  path.split(".").reduce((acc, part) => acc && acc[part], obj);

function TableRow({ row, rowIndex, columns, page, pageSize, isOpen, onToggle, renderCollapse }) {
  const collapseRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState("0px");

  useEffect(() => {
    if (isOpen && collapseRef.current) {
      setMaxHeight(collapseRef.current.scrollHeight + "px");
    } else {
      setMaxHeight("0px");
    }
  }, [isOpen]);

  return (
    <>
      <tr
        style={{ cursor: renderCollapse ? "pointer" : "default" }}
        onClick={() => renderCollapse && onToggle()}
      >
        <td className="text-center">{(page - 1) * pageSize + rowIndex + 1}</td>
        {columns.map((col, i) => {
          const value = getNestedValue(row, col.accessor);
          return (
            <td key={i} className="text-center">
              {col.render ? col.render(value, row) : value}
            </td>
          );
        })}
      </tr>
      {renderCollapse && (
        <tr className="collapse-row">
          <td colSpan={columns.length + 1}>
            <div
              ref={collapseRef}
              className={`collapse-wrapper ${isOpen ? "open" : ""}`}
              style={{ maxHeight }}
            >
              {renderCollapse(row)}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function Table({
  columns,
  data,
  page = 1,
  pageSize = 10,
  totalRecords = 0,
  onPageChange,
  onPageSizeChange,
  onSort,
  sortField,
  sortOrder,
  renderCollapse,
}) {
  const safeData = Array.isArray(data) ? data : [];
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const [colWidths, setColWidths] = useState({});
  const [openRow, setOpenRow] = useState(null);
  const tableRef = useRef(null);

  const handleSort = (field) => {
    if (onSort) {
      let order = "asc";
      if (sortField === field && sortOrder === "asc") order = "desc";
      onSort(field, order);
    }
  };

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
      <style>
        {`
          .collapse-wrapper {
            overflow: hidden;
            transition: max-height 0.35s ease, opacity 0.35s ease;
            opacity: 0;
            max-height: 0;
          }
          .collapse-wrapper.open {
            opacity: 1;
          }
          tr.collapse-row td {
            background: #f9f9f9;
            border-top: none;
          }
          tr.collapse-row td .collapse-wrapper {
            border-left: 3px solid #0d6efd;
            margin-left: 10px;
            border-radius: 4px;
            background: #fcfcfc;
            padding: 8px 12px;
          }
        `}
      </style>

      <div className="table-responsive">
        <table
          className="table table-bordered table-hover align-middle"
          ref={tableRef}
        >
          <thead className="table-primary">
            <tr>
              <th style={{ width: 50 }}>STT</th>
              {columns.map((col, i) => (
                <th
                  key={i}
                  data-accessor={col.accessor}
                  style={{
                    cursor: col.accessor ? "pointer" : "default",
                    width: colWidths[col.accessor] || "auto",
                  }}
                  onClick={() => col.accessor && handleSort(col.accessor)}
                  className="position-relative"
                >
                  {col.label}
                  {col.accessor && (
                    <span style={{ marginLeft: 4 }}>
                      {sortField === col.accessor
                        ? sortOrder === "asc"
                          ? "▲"
                          : "▼"
                        : ""}
                    </span>
                  )}
                  <div
                    onMouseDown={(e) => startResize(e, col.accessor)}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "5px",
                      height: "100%",
                      cursor: "col-resize",
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safeData.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                row={row}
                rowIndex={rowIndex}
                columns={columns}
                page={page}
                pageSize={pageSize}
                isOpen={openRow === rowIndex}
                onToggle={() =>
                  setOpenRow(openRow === rowIndex ? null : rowIndex)
                }
                renderCollapse={renderCollapse}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-2">
        {/* Page size select */}
        <div>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
            className="form-select"
            style={{ width: "auto", display: "inline-block" }}
          >
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} / trang
              </option>
            ))}
          </select>
        </div>

        {/* Pagination controls */}
        <div>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => page > 1 && onPageChange && onPageChange(page - 1)}
                >
                  «
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <li
                  key={p}
                  className={`page-item ${p === page ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => onPageChange && onPageChange(p)}
                  >
                    {p}
                  </button>
                </li>
              ))}
              <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() =>
                    page < totalPages && onPageChange && onPageChange(page + 1)
                  }
                >
                  »
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Total records */}
        <div>
          <small>
            Tổng: {totalRecords} bản ghi
          </small>
        </div>
      </div>
    </div>
  );
}
