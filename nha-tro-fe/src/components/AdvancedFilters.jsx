import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function AdvancedFilters({
  fieldOptions = [],
  filters = [],
  onAddFilter,
  onRemoveFilter,
  onSearch,
  onLoad,
  onExportCSV,
  onExportJSON,
}) {
  const [newFilter, setNewFilter] = useState({
    field: fieldOptions[0]?.value || "",
    operator: ">=",
    value: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (fieldOptions && fieldOptions.length && !newFilter.field) {
      setNewFilter((prev) => ({ ...prev, field: fieldOptions[0].value }));
    }
  }, [fieldOptions]);

  const add = () => {
    if (!newFilter.field || newFilter.value === "") {
      toast.warn("Vui lòng chọn trường và nhập giá trị lọc");
      return;
    }
    onAddFilter && onAddFilter({ ...newFilter });
    setNewFilter((prev) => ({ ...prev, value: "" }));
  };

  const handleSearch = () => {
    onSearch && onSearch(searchTerm);
  };

  return (
    <div className="mb-4">
      <h5 className="mb-3 text-warning  ">🔍 Bộ lọc nâng cao</h5>

      {/* Thanh tìm kiếm */}
      <div className="row g-3 mb-3">
        <div className="col-md-12">
          <input
            type="text"
            className="form-control"
            placeholder="Nhập từ khóa tìm kiếm..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearch && onSearch(e.target.value);
            }}
          />
          {searchTerm && (
            <button
              className="btn btn-sm btn-outline-secondary mt-2"
              type="button"
              onClick={() => {
                setSearchTerm("");
                onSearch && onSearch("");
              }}
            >
              Xóa tìm kiếm
            </button>
          )}
        </div>
      </div>

      {/* Bộ lọc nâng cao */}
      <div className="row g-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label text-warning">Trường</label>
          <select
            className="form-select"
            value={newFilter.field}
            onChange={(e) =>
              setNewFilter((prev) => ({ ...prev, field: e.target.value }))
            }
          >
            <option value="">-- Chọn trường --</option>
            {fieldOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label text-warning">Toán tử</label>
          <select
            className="form-select"
            value={newFilter.operator}
            onChange={(e) =>
              setNewFilter((prev) => ({ ...prev, operator: e.target.value }))
            }
          >
            <option value="">-- Chọn toán tử --</option>
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">{">"}</option>
            <option value="<">{"<"}</option>
            <option value=">=">{">="}</option>
            <option value="<=">{"<="}</option>
            <option value="~">Gần bằng</option>
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label text-warning">Giá trị</label>
          <input
            type="text"
            className="form-control"
            value={newFilter.value}
            onChange={(e) =>
              setNewFilter((prev) => ({ ...prev, value: e.target.value }))
            }
          />
        </div>

        <div className="col-md-3 d-flex align-items-end">
          <button className="btn btn-primary w-100" type="button" onClick={add}>
            ➕ Thêm bộ lọc
          </button>
        </div>
      </div>

      {/* Danh sách bộ lọc */}
      {filters.length > 0 && (
        <div className="mt-4">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <h6 className="mb-0">Các bộ lọc đang áp dụng:</h6>
            {filters.map((f, i) => (
              <div key={i} className="badge bg-info text-dark d-flex align-items-center gap-1 px-2 py-2">
                <span>
                  {fieldOptions.find((opt) => opt.value === f.field)?.label}{" "}
                  {f.operator} {String(f.value)}
                </span>
                <button
                  className="btn-close btn-close-dark ms-2"
                  type="button"
                  onClick={() => onRemoveFilter && onRemoveFilter(i)}
                  style={{ fontSize: "0.8rem" }}
                ></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Xuất dữ liệu */}
      <div className="mt-4 d-flex gap-2">
        <button className="btn btn-success" type="button" onClick={onExportCSV}>
          📑 Export CSV
        </button>
        <button className="btn btn-warning" type="button" onClick={onExportJSON}>
          📑 Export JSON
        </button>
      </div>
    </div>
  );
}
