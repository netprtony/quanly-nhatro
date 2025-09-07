import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API_BASE = "http://localhost:8000/report/utility";

export default function UtilityReport() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [electricity, setElectricity] = useState([]);
  const [water, setWater] = useState([]);
  const [avgCost, setAvgCost] = useState([]);
  const [compare, setCompare] = useState([]);
  const [outlier, setOutlier] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/usage-electricity`, { params: { month, year } }).then(res => setElectricity(res.data));
    axios.get(`${API_BASE}/usage-water`, { params: { month, year } }).then(res => setWater(res.data));
    axios.get(`${API_BASE}/avg-utility-cost-room`).then(res => setAvgCost(res.data));
    axios.get(`${API_BASE}/compare-month`, { params: { month, year } }).then(res => setCompare(res.data));
    axios.get(`${API_BASE}/outlier-rooms`, { params: { month, year } }).then(res => setOutlier(res.data));
  }, [month, year]);

  // Bar chart: Điện từng phòng
  const electricityChart = {
    labels: electricity.map(i => i.room_number),
    datasets: [{
      label: "Số kWh",
      data: electricity.map(i => i.usage_kwh),
      backgroundColor: "#e16162"
    }]
  };

  // Bar chart: Nước từng phòng
  const waterChart = {
    labels: water.map(i => i.room_number),
    datasets: [{
      label: "Số m³",
      data: water.map(i => i.usage_m3),
      backgroundColor: "#abd1c6"
    }]
  };

  // Bar chart: Chi phí trung bình điện/nước theo phòng
  const avgCostChart = {
    labels: avgCost.map(i => i.room_number),
    datasets: [
      {
        label: "Điện (VNĐ)",
        data: avgCost.map(i => i.avg_electricity_cost),
        backgroundColor: "#e16162"
      },
      {
        label: "Nước (VNĐ)",
        data: avgCost.map(i => i.avg_water_cost),
        backgroundColor: "#abd1c6"
      }
    ]
  };

  // Bar chart: So sánh điện/nước tháng này vs tháng trước
  const compareChart = {
    labels: compare.map(i => i.room_number),
    datasets: [
      {
        label: "Điện tháng này",
        data: compare.map(i => i.electricity_this_month),
        backgroundColor: "#e16162"
      },
      {
        label: "Điện tháng trước",
        data: compare.map(i => i.electricity_last_month),
        backgroundColor: "#f9bc60"
      },
      {
        label: "Nước tháng này",
        data: compare.map(i => i.water_this_month),
        backgroundColor: "#abd1c6"
      },
      {
        label: "Nước tháng trước",
        data: compare.map(i => i.water_last_month),
        backgroundColor: "#004643"
      }
    ]
  };

  // Outlier: phòng có mức tiêu thụ bất thường
  const outlierElectric = outlier.filter(i => i.electricity_outlier === "Outlier");
  const outlierWater = outlier.filter(i => i.water_outlier === "Outlier");

  return (
    <div className="container py-4">
      <h2 className="mb-4">Báo cáo hóa đơn điện & nước</h2>
      <div className="row mb-4">
        <div className="col-md-12 mb-3">
          <div className="d-flex gap-2 align-items-center">
            <label>Tháng:</label>
            <input type="number" min={1} max={12} value={month} onChange={e => setMonth(Number(e.target.value))} className="form-control" style={{ width: 80 }} />
            <label>Năm:</label>
            <input type="number" min={2020} max={2100} value={year} onChange={e => setYear(Number(e.target.value))} className="form-control" style={{ width: 100 }} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Tiêu thụ điện từng phòng</h5>
            <Bar data={electricityChart} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Tiêu thụ nước từng phòng</h5>
            <Bar data={waterChart} />
          </div>
        </div>
        <div className="col-md-12 mb-4">
          <div className="card p-3">
            <h5>Chi phí trung bình điện/nước theo phòng</h5>
            <Bar data={avgCostChart} />
          </div>
        </div>
        <div className="col-md-12 mb-4">
          <div className="card p-3">
            <h5>So sánh điện/nước tháng này và tháng trước</h5>
            <Bar data={compareChart} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Phòng có mức tiêu thụ điện bất thường</h5>
            <ul>
              {outlierElectric.length === 0 && <li>Không có phòng nào bất thường</li>}
              {outlierElectric.map((o, idx) => (
                <li key={idx}>{o.room_number} - {o.usage_kwh} kWh</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Phòng có mức tiêu thụ nước bất thường</h5>
            <ul>
              {outlierWater.length === 0 && <li>Không có phòng nào bất thường</li>}
              {outlierWater.map((o, idx) => (
                <li key={idx}>{o.room_number} - {o.usage_m3} m³</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}