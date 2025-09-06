import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API_BASE = "http://localhost:8000/report/tenants";

export default function TenantsReport() {
  const [statusData, setStatusData] = useState([]);
  const [genderAgeData, setGenderAgeData] = useState([]);
  const [newTenants, setNewTenants] = useState([]);
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [debtTenants, setDebtTenants] = useState([]);
  const [periodType, setPeriodType] = useState("MONTH");

  useEffect(() => {
    axios.get(`${API_BASE}/status`).then(res => setStatusData(res.data));
    axios.get(`${API_BASE}/gender-age`).then(res => setGenderAgeData(res.data));
    axios.get(`${API_BASE}/new?period_type=${periodType}`).then(res => setNewTenants(res.data));
    axios.get(`${API_BASE}/expiring-contracts`).then(res => setExpiringContracts(res.data));
    axios.get(`${API_BASE}/debt`).then(res => setDebtTenants(res.data));
  }, [periodType]);

  // Chart data
  const statusChart = {
    labels: statusData.map(i => i.tenant_status || i.status),
    datasets: [{
      label: "Số lượng khách thuê",
      data: statusData.map(i => i.total || i.total_tenants),
      backgroundColor: ["#f9bc60", "#abd1c6", "#e16162"]
    }]
  };

  const genderChart = {
    labels: genderAgeData.map(i => i.gender),
    datasets: [{
      label: "Số lượng",
      data: genderAgeData.map(i => i.total),
      backgroundColor: ["#f9bc60", "#abd1c6", "#e16162"]
    }]
  };

  const ageChart = {
    labels: genderAgeData.map(i => i.gender + " (Tuổi TB)"),
    datasets: [{
      label: "Tuổi TB",
      data: genderAgeData.map(i => i.avg_age),
      backgroundColor: "#f9bc60"
    }]
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Báo cáo thống kê khách thuê</h2>
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Thống kê khách thuê theo trạng thái</h5>
            <Pie data={statusChart} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Thống kê giới tính khách thuê</h5>
            <Doughnut data={genderChart} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Tuổi trung bình theo giới tính</h5>
            <Bar data={ageChart} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Khách thuê mới ({periodType === "MONTH" ? "Tháng này" : periodType === "QUARTER" ? "Quý này" : "Năm nay"})</h5>
            <select className="form-select mb-2" value={periodType} onChange={e => setPeriodType(e.target.value)}>
              <option value="MONTH">Tháng này</option>
              <option value="QUARTER">Quý này</option>
              <option value="YEAR">Năm nay</option>
            </select>
            <ul>
              {newTenants.map(t => (
                <li key={t.tenant_id}>{t.full_name} ({t.phone_number})</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Khách thuê sắp hết hạn hợp đồng (30 ngày tới)</h5>
            <ul>
              {expiringContracts.map(c => (
                <li key={c.contract_id || c.tenant_id}>
                  {c.full_name} - Hết hạn: {c.end_date}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Khách thuê nợ tiền</h5>
            <ul>
              {debtTenants.map(d => (
                <li key={d.invoice_id || d.tenant_id}>
                  {d.full_name} - Còn nợ: {(d.remaining_amount || d.debt || 0).toLocaleString()}đ
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}