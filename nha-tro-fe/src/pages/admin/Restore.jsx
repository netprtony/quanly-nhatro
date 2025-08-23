import React, { useState, useEffect } from "react";
import ModalConfirm from "/src/components/ModalConfirm.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RESTORE_API = "http://localhost:8000/backup/restore";
const BACKUP_LIST_API = "http://localhost:8000/backup/list";

export default function Restore() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backupFiles, setBackupFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Lấy danh sách file backup khi mở trang
  useEffect(() => {
    fetch(BACKUP_LIST_API)
      .then((res) => res.json())
      .then((data) => {
        // Đảm bảo backupFiles là mảng file .sql
        if (data && Array.isArray(data.backups)) {
          setBackupFiles(data.backups.filter((f) => f.filename.endsWith(".sql")));
        } else {
          setBackupFiles([]);
        }
      })
      .catch(() => setBackupFiles([]));
  }, []);

  const handleRestore = () => {
    setShowConfirm(true);
  };

  const handleConfirmRestore = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const params = new URLSearchParams({
        backup_file: backupFiles.find((f) => f.filename === selectedFile)?.path || "",
        start_time: startTime,
        end_time: endTime,
      });
      const res = await fetch(`${RESTORE_API}?${params.toString()}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Phục hồi dữ liệu thành công!");
      } else {
        toast.error("Phục hồi thất bại: " + (data.detail || "Lỗi không xác định"));
      }
    } catch (err) {
      toast.error("Phục hồi thất bại!");
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4 position-relative">
      <div className="p-4 rounded shadow bg-white text-center">
        <h3 className="mb-3">🔄 Phục hồi dữ liệu hệ thống</h3>
        <p>Bạn có thể phục hồi dữ liệu về trạng thái đã sao lưu.</p>
        <div className="mb-3">
          <label className="form-label">Chọn file backup</label>
          <select
            className="form-select"
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
          >
            <option value="">-- Chọn file --</option>
            {backupFiles.map((file) => (
              <option key={file.filename} value={file.filename}>
                {file.filename}
              </option>
            ))}
          </select>
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Từ thời gian</label>
            <input
              type="datetime-local"
              className="form-control"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value.replace("T", " ")+":00")}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Đến thời gian</label>
            <input
              type="datetime-local"
              className="form-control"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value.replace("T", " ")+":00")}
            />
          </div>
        </div>
        <button
          className="btn btn-warning"
          onClick={handleRestore}
          disabled={loading || !selectedFile}
        >
          {loading ? "Đang phục hồi..." : "🔄 Phục hồi dữ liệu"}
        </button>
      </div>

      <ModalConfirm
        isOpen={showConfirm}
        title="Xác nhận phục hồi"
        message="Bạn có chắc chắn muốn phục hồi dữ liệu không? Thao tác này không thể hoàn tác."
        confirmText="Phục hồi"
        cancelText="Hủy"
        onConfirm={handleConfirmRestore}
        onClose={() => setShowConfirm(false)}
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}