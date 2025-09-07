import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Bar, Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API_BASE = "http://localhost:8000/report/rooms";

export default function RoomsReport() {
  const [availability, setAvailability] = useState([]);
  const [avgRevenue, setAvgRevenue] = useState([]);
  const [statusByFloor, setStatusByFloor] = useState([]);
  const [topTypes, setTopTypes] = useState([]);
  const [maintenance, setMaintenance] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/availability`).then(res => setAvailability(res.data));
    axios.get(`${API_BASE}/avg-revenue`).then(res => setAvgRevenue(res.data));
    axios.get(`${API_BASE}/status-floor`).then(res => setStatusByFloor(res.data));
    axios.get(`${API_BASE}/top-types`).then(res => setTopTypes(res.data));
    axios.get(`${API_BASE}/maintenance`).then(res => setMaintenance(res.data));
  }, []);

  // Pie chart: Tỷ lệ phòng trống/đang thuê
  const availabilityChart = {
    labels: availability.map(i => i.is_available ? "Phòng trống" : "Đang thuê"),
    datasets: [{
      data: availability.map(i => i.total_rooms),
      backgroundColor: ["#abd1c6", "#e16162"]
    }]
  };

  // Bar chart: Doanh thu trung bình theo loại phòng
  const avgRevenueChart = {
    labels: avgRevenue.map(i => i.room_type),
    datasets: [{
      label: "Doanh thu TB (VNĐ)",
      data: avgRevenue.map(i => i.avg_revenue),
      backgroundColor: "#f9bc60"
    }]
  };

  // Bar chart: Tình trạng phòng theo tầng
  const statusByFloorChart = {
    labels: statusByFloor.map(i => "Tầng " + i.floor_number),
    datasets: [
      {
        label: "Phòng trống",
        data: statusByFloor.map(i => i.available_rooms),
        backgroundColor: "#abd1c6"
      },
      {
        label: "Đang thuê",
        data: statusByFloor.map(i => i.occupied_rooms),
        backgroundColor: "#e16162"
      }
    ]
  };

  // Doughnut chart: Top loại phòng được thuê nhiều nhất
  const topTypesChart = {
    labels: topTypes.map(i => i.type_name),
    datasets: [{
      label: "Số hợp đồng",
      data: topTypes.map(i => i.total_contracts),
      backgroundColor: ["#f9bc60", "#abd1c6", "#e16162", "#004643", "#001e1d"]
    }]
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Báo cáo thống kê phòng</h2>
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Tỷ lệ phòng trống / đang thuê</h5>
            <Pie data={availabilityChart} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Doanh thu trung bình theo loại phòng</h5>
            <Bar data={avgRevenueChart} />
          </div>
        </div>
        <div className="col-md-12 mb-4">
          <div className="card p-3">
            <h5>Tình trạng phòng theo tầng</h5>
            <Bar data={statusByFloorChart} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Top loại phòng được thuê nhiều nhất</h5>
            <Doughnut data={topTypesChart} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Phòng cần bảo trì thiết bị</h5>
            <ul>
              {maintenance.length === 0 && <li>Tất cả thiết bị đều hoạt động tốt</li>}
              {maintenance.map((m, idx) => (
                <li key={idx}>
                  {m.room_number} - {m.device_name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}