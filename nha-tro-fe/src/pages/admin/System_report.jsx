import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API_BASE = "http://localhost:8000/report";

export default function SystemReport() {
  const now = new Date();
  const [periodType, setPeriodType] = useState("MONTH");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [quarter, setQuarter] = useState(Math.floor((now.getMonth() + 3) / 3));
  const [year, setYear] = useState(now.getFullYear());

  const [pendingReservations, setPendingReservations] = useState([]);
  const [notificationCount, setNotificationCount] = useState([]);
  const [notificationReadRatio, setNotificationReadRatio] = useState([]);
  const [brokenDevices, setBrokenDevices] = useState([]);
  const [deviceList, setDeviceList] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/reservations/pending`).then(res => setPendingReservations(res.data));
    axios.get(`${API_BASE}/notifications/count-by-period`, {
      params: {
        period_type: periodType,
        month: periodType === "MONTH" ? month : undefined,
        quarter: periodType === "QUARTER" ? quarter : undefined,
        year: year
      }
    }).then(res => setNotificationCount(res.data));
    axios.get(`${API_BASE}/notifications/read-ratio`).then(res => setNotificationReadRatio(res.data));
    axios.get(`${API_BASE}/devices/broken`).then(res => setBrokenDevices(res.data));
    axios.get(`${API_BASE}/devices/list-status`).then(res => setDeviceList(res.data));
  }, [periodType, month, quarter, year]);

  // Pie chart: Tỷ lệ thông báo đã đọc/chưa đọc
  const notificationReadChart = {
    labels: notificationReadRatio.map(i => i.is_read ? "Đã đọc" : "Chưa đọc"),
    datasets: [{
      data: notificationReadRatio.map(i => i.total),
      backgroundColor: ["#abd1c6", "#e16162"]
    }]
  };

  // Bar chart: Số lượng thông báo gửi theo kỳ
  const notificationCountChart = {
    labels: notificationCount.map(n =>
      periodType === "MONTH" ? `Tháng ${n.month}/${n.year}` :
      periodType === "QUARTER" ? `Quý ${n.quarter}/${n.year}` :
      `Năm ${n.year}`
    ),
    datasets: [{
      label: "Số thông báo gửi",
      data: notificationCount.map(n => n.total_notifications),
      backgroundColor: "#f9bc60"
    }]
  };

  // Bar chart: Số thiết bị hỏng theo phòng
  const brokenDevicesChart = {
    labels: brokenDevices.map(d => d.room_number),
    datasets: [{
      label: "Số thiết bị hỏng",
      data: brokenDevices.map(d => d.broken_count),
      backgroundColor: "#e16162"
    }]
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Báo cáo thống kê hệ thống</h2>
      <div className="row mb-4">
        <div className="col-md-12 mb-3">
          <div className="d-flex gap-2 align-items-center">
            <label>Kỳ:</label>
            <select className="form-select" style={{ width: 120 }} value={periodType} onChange={e => setPeriodType(e.target.value)}>
              <option value="MONTH">Tháng</option>
              <option value="QUARTER">Quý</option>
              <option value="YEAR">Năm</option>
            </select>
            {periodType === "MONTH" && (
              <>
                <label>Tháng:</label>
                <input type="number" min={1} max={12} value={month} onChange={e => setMonth(Number(e.target.value))} className="form-control" style={{ width: 80 }} />
              </>
            )}
            {periodType === "QUARTER" && (
              <>
                <label>Quý:</label>
                <select className="form-select" value={quarter} onChange={e => setQuarter(Number(e.target.value))} style={{ width: 80 }}>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
              </>
            )}
            <label>Năm:</label>
            <input type="number" min={2020} max={2100} value={year} onChange={e => setYear(Number(e.target.value))} className="form-control" style={{ width: 100 }} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Tỷ lệ thông báo đã đọc</h5>
            <Pie data={notificationReadChart} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Số lượng thông báo gửi</h5>
            <Bar data={notificationCountChart} />
          </div>
        </div>
        <div className="col-md-12 mb-4">
          <div className="card p-3">
            <h5>Danh sách đặt phòng đang chờ xử lý</h5>
            <ul>
              {pendingReservations.length === 0 && <li>Không có đặt phòng nào đang chờ xử lý</li>}
              {pendingReservations.map(r => (
                <li key={r.reservation_id}>
                  {r.full_name || r.contact_phone} - Phòng: {r.room_id} - Ngày đặt: {r.created_at?.slice(0, 10)}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-md-12 mb-4">
          <div className="card p-3">
            <h5>Số thiết bị hỏng theo phòng</h5>
            <Bar data={brokenDevicesChart} />
          </div>
        </div>
        <div className="col-md-12 mb-4">
          <div className="card p-3">
            <h5>Danh sách thiết bị & trạng thái hoạt động</h5>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Tên thiết bị</th>
                  <th>Trạng thái</th>
                  <th>Mô tả</th>
                  <th>Ngày thêm</th>
                </tr>
              </thead>
              <tbody>
                {deviceList.length === 0 && (
                  <tr>
                    <td colSpan={5}>Không có thiết bị</td>
                  </tr>
                )}
                {deviceList.map((d, idx) => (
                  <tr key={d.device_id || idx}>
                    <td>{d.room_number || "Chưa gán"}</td>
                    <td>{d.device_name}</td>
                    <td>
                      <span className={d.is_active ? "text-success" : "text-danger"}>
                        {d.is_active ? "Hoạt động" : "Hỏng"}
                      </span>
                    </td>
                    <td>{d.description}</td>
                    <td>{d.created_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}