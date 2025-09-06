import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API_BASE = "http://localhost:8000/report/contracts";

export default function ContractsReport() {
  const [statusRatio, setStatusRatio] = useState([]);
  const [avgDuration, setAvgDuration] = useState(null);
  const [newContracts, setNewContracts] = useState([]);
  const [expiredContracts, setExpiredContracts] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [periodType, setPeriodType] = useState("MONTH");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(Math.floor((new Date().getMonth() + 3) / 3));

  useEffect(() => {
    axios.get(`${API_BASE}/status-ratio`).then(res => setStatusRatio(res.data));
    axios.get(`${API_BASE}/avg-duration`).then(res => setAvgDuration(res.data[0]?.avg_duration_days || null));
    // Lấy hợp đồng mới theo kỳ
    axios.get(`${API_BASE}/new`, {
      params: {
        period_type: periodType,
        month: periodType === "MONTH" ? month : undefined,
        quarter: periodType === "QUARTER" ? quarter : undefined,
        year: year
      }
    }).then(res => setNewContracts(res.data));
    axios.get(`${API_BASE}/expired`).then(res => setExpiredContracts(res.data));
    axios.get(`${API_BASE}/expiring-soon`).then(res => setExpiringSoon(res.data));
  }, [periodType, month, quarter, year]);

  // Pie chart: Tỷ lệ hợp đồng theo trạng thái
  const statusChart = {
    labels: statusRatio.map(i => i.contract_status),
    datasets: [{
      data: statusRatio.map(i => i.total),
      backgroundColor: ["#f9bc60", "#abd1c6", "#e16162"]
    }]
  };

  // Bar chart: Số hợp đồng mới theo kỳ
  const newContractsChart = {
    labels: newContracts.map((c, idx) =>
      periodType === "MONTH" ? `Tháng ${c.month}/${c.year}` :
      periodType === "QUARTER" ? `Quý ${c.quarter}/${c.year}` :
      `Năm ${c.year}`
    ),
    datasets: [{
      label: "Số hợp đồng mới",
      data: newContracts.map(c => c.total_new_contracts),
      backgroundColor: "#f9bc60"
    }]
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Báo cáo thống kê hợp đồng</h2>
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Tỷ lệ hợp đồng theo trạng thái</h5>
            <Pie data={statusChart} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Thời hạn trung bình hợp đồng</h5>
            <div style={{ fontSize: 32, fontWeight: "bold" }}>
              {avgDuration !== null ? `${Math.round(avgDuration)} ngày` : "Đang tải..."}
            </div>
          </div>
        </div>
        <div className="col-md-12 mb-4">
          <div className="card p-3">
            <h5>Số hợp đồng mới theo kỳ</h5>
            <div className="row mb-2">
              <div className="col-md-3">
                <select className="form-select" value={periodType} onChange={e => setPeriodType(e.target.value)}>
                  <option value="MONTH">Tháng</option>
                  <option value="QUARTER">Quý</option>
                  <option value="YEAR">Năm</option>
                </select>
              </div>
              {periodType === "MONTH" && (
                <div className="col-md-3">
                  <input type="number" min={1} max={12} className="form-control" value={month} onChange={e => setMonth(Number(e.target.value))} />
                </div>
              )}
              {periodType === "QUARTER" && (
                <div className="col-md-3">
                  <select className="form-select" value={quarter} onChange={e => setQuarter(Number(e.target.value))}>
                    <option value={1}>Quý 1</option>
                    <option value={2}>Quý 2</option>
                    <option value={3}>Quý 3</option>
                    <option value={4}>Quý 4</option>
                  </select>
                </div>
              )}
              <div className="col-md-3">
                <input type="number" min={2020} max={2100} className="form-control" value={year} onChange={e => setYear(Number(e.target.value))} />
              </div>
            </div>
            <Bar data={newContractsChart} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Hợp đồng đã hết hạn</h5>
            <ul>
              {expiredContracts.length === 0 && <li>Không có hợp đồng nào đã hết hạn</li>}
              {expiredContracts.map(c => (
                <li key={c.contract_id}>
                  {c.full_name} - {c.room_number} ({c.start_date} - {c.end_date})
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Hợp đồng sắp hết hạn (30 ngày tới)</h5>
            <ul>
              {expiringSoon.length === 0 && <li>Không có hợp đồng nào sắp hết hạn</li>}
              {expiringSoon.map(c => (
                <li key={c.contract_id}>
                  {c.full_name} - {c.room_number} ({c.start_date} - {c.end_date})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}