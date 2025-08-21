import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Table from "/src/components/Table.jsx";
import AdvancedFilters from "/src/components/AdvancedFilters.jsx";
import Modal from "/src/components/Modal.jsx";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExcelJS from "exceljs";
import * as FileSaver from "file-saver";

const ROOMS_API = "http://localhost:8000/rooms/all";
const ELECTRICITY_API = "http://localhost:8000/electricity";

export default function Electricity() {
  const [electricities, setElectricities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingElectricity, setEditingElectricity] = useState(null);
  const [electricityRateInput, setElectricityRateInput] = useState(3500);
  const [form, setForm] = useState({
    room_id: "",
    month: "",
    old_reading: "",
    new_reading: "",
    electricity_rate: electricityRateInput,
    note: "",
  });
  const fileInputRef = useRef();
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [electricityToDelete, setElectricityToDelete] = useState(null);

  // Advanced filters state
  const [filters, setFilters] = useState([]);
  const [newFilter, setNewFilter] = useState({ field: "room_id", operator: "=", value: "" });

  // Phân trang
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);

  const fieldOptions = [
    { value: "room_id", label: "Phòng", type: "number" },
    { value: "month", label: "Tháng", type: "string" },
    { value: "old_reading", label: "Chỉ số cũ", type: "number" },
    { value: "new_reading", label: "Chỉ số mới", type: "number" },
    { value: "electricity_rate", label: "Đơn giá", type: "number" },
  ];

  const columns = [
    { label: "ID", accessor: "meter_id" },
    {
      label: "Phòng",
      accessor: "room_id",
      render: (room_id) => {
        const room = rooms.find(r => r.room_id === room_id);
        return room ? room.room_number : room_id;
      }
    },
    { label: "Tháng", accessor: "month" },
    { label: "Chỉ số cũ", accessor: "old_reading" },
    { label: "Chỉ số mới", accessor: "new_reading" },
    {
      label: "Số kWh",
      accessor: "usage_kwh",
      render: (_, row) => row.new_reading - row.old_reading,
    },
    {
      label: "Thành tiền",
      accessor: "total_amount",
      render: (value) =>
        typeof value === "number"
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value)
          : "N/A",
    },
    {
      label: "Đơn giá (kWh)",
      accessor: "electricity_rate",
      render: (value) =>
        typeof value === "number"
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value)
          : "N/A",
    },
    {
      label: "Thao tác",
      accessor: "actions",
      render: (_, electricity) => (
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(electricity)}>Sửa</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(electricity.meter_id)}>Xóa</button>
        </div>
      ),
    },
  ];

  // Lấy danh sách phòng (lấy nhiều để đủ cho combobox)
  const fetchRooms = async () => {
    try {
      // Gọi API get_all_rooms với filter_is_available=false
      const res = await axios.get(`${ROOMS_API}?filter_is_available=false`);
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("❌ Lỗi khi lấy danh sách phòng!");
      setRooms([]);
    }
  };

  // Lấy danh sách hóa đơn điện có phân trang
  const fetchElectricities = async () => {
    try {
      let query = `?page=${page}&page_size=${pageSize}`;
      if (filters.length > 0) {
        query += "&" + filters
          .map(
            (f) =>
              `filter_${f.field}=${encodeURIComponent(
                f.operator + f.value
              )}`
          )
          .join("&");
      }
      const res = await axios.get(ELECTRICITY_API + query);
      const data = res.data;
      setElectricities(Array.isArray(data.items) ? data.items : []);
      setTotalRecords(data.total || 0);
    } catch (err) {
      toast.error("❌ Lỗi khi lấy danh sách hóa đơn điện!");
      setElectricities([]);
      setTotalRecords(0);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchElectricities();
    // eslint-disable-next-line
  }, [filters, page, pageSize]);

  const handleAdd = () => {
    setForm({
      room_id: "",
      month: "",
      old_reading: "",
      new_reading: "",
      electricity_rate: electricityRateInput,
      note: "",
    });
    setEditingElectricity(null);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleEdit = (electricity) => {
    setForm({
      room_id: electricity.room_id ? String(electricity.room_id) : "",
      month: electricity.month,
      old_reading: electricity.old_reading,
      new_reading: electricity.new_reading,
      electricity_rate: electricity.electricity_rate,
      note: electricity.note || "",
    });
    setEditingElectricity(electricity);
    setUnsavedChanges(false);
    setShowModal(true);
  };

  const handleDelete = (electricityId) => {
    setElectricityToDelete(electricityId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${ELECTRICITY_API}/${electricityToDelete}`);
      toast.success("🗑️ Xóa hóa đơn điện thành công!");
      fetchElectricities();
    } catch (err) {
      toast.error("❌ Lỗi xóa hóa đơn điện!");
    } finally {
      setShowConfirmDelete(false);
      setElectricityToDelete(null);
    }
  };

  const handleSubmitElectricity = async () => {
    if (parseInt(form.old_reading) > parseInt(form.new_reading)) {
      toast.error("❌ Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ!");
      return;
    }
    const payload = {
      ...form,
      room_id: form.room_id ? parseInt(form.room_id) : null,
      old_reading: form.old_reading ? parseInt(form.old_reading) : 0,
      new_reading: form.new_reading ? parseInt(form.new_reading) : 0,
      electricity_rate: form.electricity_rate ? parseFloat(form.electricity_rate) : 3500,
      month: form.month ? form.month + "-01" : "", // chuyển từ yyyy-MM sang yyyy-MM-01
    };
    try {
      if (editingElectricity) {
        await axios.put(`${ELECTRICITY_API}/${editingElectricity.meter_id}`, payload);
        toast.success("✏️ Cập nhật hóa đơn điện thành công!");
      } else {
        await axios.post(ELECTRICITY_API, payload);
        toast.success("✅ Thêm hóa đơn điện thành công!");
      }
      setShowModal(false);
      fetchElectricities();
    } catch (err) {
      toast.error("❌ Lỗi khi lưu hóa đơn điện!");
    }
  };

  const handleCloseModal = () => {
    if (unsavedChanges) {
      setShowConfirmExit(true);
    } else {
      setShowModal(false);
    }
  };

  // Thêm state để kiểm soát việc tự động lấy chỉ số cũ
  const [autoOldReading, setAutoOldReading] = useState(null);

  // Hàm lấy chỉ số mới của tháng trước
  const fetchPreviousMonthReading = async (room_id, month) => {
    if (!room_id || !month) {
      setAutoOldReading(null);
      return;
    }
    // Tính tháng trước
    const [year, mon] = month.split("-");
    let prevMonth = parseInt(mon) - 1;
    let prevYear = parseInt(year);
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevMonthStr = `${prevYear}-${prevMonth.toString().padStart(2, "0")}-01`;

    try {
      // Gọi API lấy công tơ điện của phòng và tháng trước
      const res = await axios.get(`${ELECTRICITY_API}?room_id=${room_id}&month=${prevMonthStr}`);
      if (res.data && res.data.length > 0) {
        setAutoOldReading(res.data[0].new_reading);
        setForm((prev) => ({ ...prev, old_reading: res.data[0].new_reading }));
      } else {
        setAutoOldReading(0);
        setForm((prev) => ({ ...prev, old_reading: 0 }));
      }
    } catch {
      setAutoOldReading(0);
      setForm((prev) => ({ ...prev, old_reading: 0 }));
    }
  };

  // Khi chọn phòng hoặc tháng thì tự động lấy chỉ số cũ
  useEffect(() => {
    if (form.room_id && form.month && !editingElectricity) {
      fetchPreviousMonthReading(form.room_id, form.month);
    }
    // eslint-disable-next-line
  }, [form.room_id, form.month]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
    // Nếu thay đổi phòng hoặc tháng thì reset chỉ số cũ
    if ((field === "room_id" || field === "month") && !editingElectricity) {
      setAutoOldReading(null);
    }
  };

  // Advanced filter logic (same as Rooms)
  const getValueByPath = (obj, path) => {
    return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj);
  };

  const evaluateFilter = (f, item) => {
    const raw = getValueByPath(item, f.field);
    if (raw === undefined || raw === null) return false;

    const maybeNum = Number(raw);
    const targetNum = Number(f.value);
    const isNumeric = !isNaN(maybeNum) && !isNaN(targetNum);

    if (isNumeric) {
      switch (f.operator) {
        case '>': return maybeNum > targetNum;
        case '<': return maybeNum < targetNum;
        case '>=': return maybeNum >= targetNum;
        case '<=': return maybeNum <= targetNum;
        case '=': return maybeNum === targetNum;
        case '~':
          const diff = Math.abs(maybeNum - targetNum);
          const tol = Math.max(1, Math.abs(targetNum) * 0.1);
          return diff <= tol;
        default: return false;
      }
    }

    // string operations
    const rawStr = String(raw).toLowerCase();
    const valStr = String(f.value).toLowerCase();
    if (f.operator === '=') return rawStr === valStr;
    if (f.operator === '~') return rawStr.includes(valStr);
    return false;
  };

  const applyFilters = (list) => {
    if (!filters || filters.length === 0) return list;
    return list.filter((item) => filters.every((f) => evaluateFilter(f, item)));
  };

  const filteredElectricities = applyFilters(electricities);

  const handleExportExcel = async () => {
    try {
      // Lấy danh sách phòng đang có người ở
      const resRooms = await axios.get(`${ROOMS_API}?filter_is_available=False`);
      const roomsData = Array.isArray(resRooms.data) ? resRooms.data : [];

      // Lấy tháng hiện tại
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const currentMonthStr = `${year}-${month}`;

      // Lấy danh sách công tơ điện của tất cả phòng/tháng gần nhất
      const exportRows = [];
      for (const room of roomsData) {
        // Tìm tháng gần nhất đã có hóa đơn điện
        const resMeters = await axios.get(`${ELECTRICITY_API}?room_id=${room.room_id}&_sort=month&_order=desc&_limit=1`);
        let oldReading = 0;
        if (resMeters.data && resMeters.data.length > 0) {
          oldReading = resMeters.data[0].new_reading;
        }
        exportRows.push({
          room_id: room.room_id,
          room_number: room.room_number,
          month: currentMonthStr, // luôn là tháng hiện tại
          old_reading: oldReading,
          new_reading: "", // để trống cho nhân viên nhập
          electricity_rate: electricityRateInput,
        });
      }

      // Tạo file Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Ghi số điện tháng mới");

      worksheet.columns = [
        { header: "room_id", key: "room_id", width: 10 },
        { header: "room_number", key: "room_number", width: 15 },
        { header: "month", key: "month", width: 10 },
        { header: "old_reading", key: "old_reading", width: 15 },
        { header: "new_reading", key: "new_reading", width: 15 },
        { header: "electricity_rate", key: "electricity_rate", width: 18 },
      ];

      exportRows.forEach(row => worksheet.addRow(row));

      const buffer = await workbook.xlsx.writeBuffer();
      const filename = `ghi_so_dien_${currentMonthStr}.xlsx`;
      FileSaver.saveAs(new Blob([buffer]), filename);
      toast.success("✅ Đã xuất file ghi số điện tháng mới!");
    } catch (err) {
      toast.error("❌ Lỗi xuất file Excel!");
    }
  };

  // Hàm xử lý import file Excel
  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const worksheet = workbook.worksheets[0];
      const rows = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Bỏ header
        const [
          room_id,
          room_number,
          month,
          old_reading,
          new_reading,
          electricity_rate,
        ] = row.values.slice(1); // ExcelJS row.values[0] is undefined
        rows.push({
          room_id,
          room_number,
          month,
          old_reading,
          new_reading,
          electricity_rate,
          rowNumber,
        });
      });

      let hasError = false;
      let errorMessages = [];
      for (const r of rows) {
        if (
          !r.room_id ||
          !r.month ||
          r.old_reading === undefined ||
          r.new_reading === undefined ||
          !r.electricity_rate
        ) {
          hasError = true;
          errorMessages.push(
            `Thiếu dữ liệu ở dòng ${r.rowNumber}: room_id=${r.room_id}, month=${r.month}, old_reading=${r.old_reading}, new_reading=${r.new_reading}, electricity_rate=${r.electricity_rate}`
          );
          continue;
        }
        if (parseInt(r.old_reading) > parseInt(r.new_reading)) {
          hasError = true;
          errorMessages.push(
            `Lỗi ở dòng ${r.rowNumber}: Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ!`
          );
          continue;
        }
        // Gửi từng hóa đơn điện lên backend
        try {
          await axios.post(ELECTRICITY_API, {
            room_id: parseInt(r.room_id),
            month: r.month.length === 7 ? r.month + "-01" : r.month, // yyyy-MM -> yyyy-MM-01
            old_reading: parseInt(r.old_reading),
            new_reading: parseInt(r.new_reading),
            electricity_rate: parseFloat(r.electricity_rate),
          });
        } catch (err) {
          hasError = true;
          errorMessages.push(
            `Lỗi ở dòng ${r.rowNumber}: ${err.response?.data?.detail || err.message}`
          );
        }
      }

      if (hasError) {
        toast.error(
          "Có lỗi khi import:\n" + errorMessages.join("\n"),
          { autoClose: false }
        );
      } else {
        toast.success("✅ Import hóa đơn điện thành công!");
      }
      fetchElectricities();
    } catch (err) {
      toast.error("❌ Lỗi đọc file Excel!");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="container mt-4 position-relative">
      <div className="p-4 rounded shadow bg-white">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="mb-0">⚡ Quản lý điện</h3>
          <div>
            <button className="btn btn-success me-2" onClick={handleAdd}>
              ➕ Thêm hóa đơn điện
            </button>
            <button className="btn btn-outline-primary me-2" onClick={handleExportExcel}>
              ⬇️ Ghi số điện tháng mới
            </button>
            <input
              type="number"
              className="form-control btn-outline- d-inline-block me-2"
              style={{ width: 120, verticalAlign: "middle" }}
              value={electricityRateInput}
              onChange={e => setElectricityRateInput(Number(e.target.value))}
              min={0}
              placeholder="Đơn giá điện"
            />
            <label className="btn btn-outline-success mb-0">
              ⬆️ Import Excel
              <input
                type="file"
                accept=".xlsx"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleImportExcel}
              />
            </label>
          </div>
        </div>

        <div className="mb-3">
          <AdvancedFilters
            fieldOptions={fieldOptions}
            filters={filters}
            onAddFilter={(f) => setFilters((prev) => [...prev, f])}
            onRemoveFilter={(i) => setFilters((prev) => prev.filter((_, idx) => idx !== i))}
            compact
          />
        </div>

        <Table
          columns={columns}
          data={electricities}
          page={page}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />

        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingElectricity ? "✏️ Chỉnh sửa hóa đơn điện" : "➕ Thêm hóa đơn điện"}
          showConfirm
          onConfirm={handleSubmitElectricity}
        >
          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Phòng</label>
                <select
                  className="form-select"
                  value={form.room_id}
                  onChange={(e) => handleFormChange("room_id", e.target.value)}
                  required
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map(room => (
                    <option key={room.room_id} value={room.room_id}>
                      {room.room_number}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Tháng</label>
                <input
                  type="month"
                  className="form-control"
                  value={form.month}
                  onChange={(e) => handleFormChange("month", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Chỉ số cũ</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.old_reading}
                  readOnly={autoOldReading !== null && !editingElectricity}
                  onChange={(e) => handleFormChange("old_reading", e.target.value)}
                  required
                />
                {autoOldReading !== null && !editingElectricity && (
                  <small className="text-muted">
                    Tự động lấy chỉ số mới tháng trước: {autoOldReading}
                  </small>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label">Chỉ số mới</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.new_reading}
                  onChange={(e) => handleFormChange("new_reading", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Đơn giá (VND/kWh)</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.electricity_rate}
                  onChange={(e) => handleFormChange("electricity_rate", e.target.value)}
                  required
                />
              </div>
              
            </div>
          </form>
        </Modal>

        <ModalConfirm
          isOpen={showConfirmDelete}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa hóa đơn điện này không?"
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={confirmDelete}
          onClose={() => setShowConfirmDelete(false)}
        />

        <ModalConfirm
          isOpen={showConfirmExit}
          title="Thoát mà chưa lưu?"
          message="Bạn có thay đổi chưa được lưu. Thoát không?"
          confirmText="Thoát"
          cancelText="Ở lại"
          onConfirm={() => {
            setShowModal(false);
            setShowConfirmExit(false);
            setUnsavedChanges(false);
          }}
          onClose={() => setShowConfirmExit(false)}
        />
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}