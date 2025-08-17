import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function AdvancedFilters({ fieldOptions = [], filters = [], onAddFilter, onRemoveFilter }) {
  const [newFilter, setNewFilter] = useState({ field: fieldOptions[0]?.value || "", operator: ">=", value: "" });

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

  return (
    <div className="mb-4">
      <h5 className="mb-3">🔍 Bộ lọc nâng cao</h5>
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Trường</label>
          <select
            className="form-select"
            value={newFilter.field}
            onChange={(e) => setNewFilter((prev) => ({ ...prev, field: e.target.value }))}
          >
            <option value="">-- Chọn trường --</option>
            {fieldOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Toán tử</label>
          <select
            className="form-select"
            value={newFilter.operator}
            onChange={(e) => setNewFilter((prev) => ({ ...prev, operator: e.target.value }))}
          >
            <option value="">-- Chọn toán tử --</option>
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">{'>'}</option>
            <option value="<">{'<'}</option>
            <option value=">=">{'>='}</option>
            <option value="<=">{'<='}</option>
            <option value="~">Gần bằng</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Giá trị</label>
          <input
            type="text"
            className="form-control"
            value={newFilter.value}
            onChange={(e) => setNewFilter((prev) => ({ ...prev, value: e.target.value }))}
          />
        </div>

        <div className="col-12">
          <button className="btn btn-primary" type="button" onClick={add}>
            Thêm bộ lọc
          </button>
        </div>
      </div>

      {filters.length > 0 && (
        <div className="mt-4">
          <h6>Các bộ lọc đang áp dụng:</h6>
          <div className="d-flex flex-wrap gap-2">
            {filters.map((f, i) => (
              <div key={i} className="badge bg-info text-dark d-flex align-items-center gap-1">
                <span>
                  {fieldOptions.find((opt) => opt.value === f.field)?.label} {f.operator} {String(f.value)}
                </span>
                <button className="btn-close btn-close-dark" type="button" onClick={() => onRemoveFilter && onRemoveFilter(i)}></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
