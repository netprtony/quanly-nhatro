import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API_BASE = "http://localhost:8000/report/invoices";
const PAY_API_BASE = "http://localhost:8000/report/payments";

export default function RevenuesReport() {
  const now = new Date();
  const [periodType, setPeriodType] = useState("MONTH");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [quarter, setQuarter] = useState(Math.floor((now.getMonth() + 3) / 3));
  const [year, setYear] = useState(now.getFullYear());

  const [revenueByPeriod, setRevenueByPeriod] = useState([]);
  const [paidRatio, setPaidRatio] = useState([]);
  const [revenueByFeeType, setRevenueByFeeType] = useState([]);
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [totalByMethod, setTotalByMethod] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/revenue-by-period`, {
      params: {
        period_type: periodType,
        month: periodType === "MONTH" ? month : undefined,
        quarter: periodType === "QUARTER" ? quarter : undefined,
        year: year
      }
    }).then(res => setRevenueByPeriod(res.data));

    axios.get(`${API_BASE}/paid-ratio`).then(res => setPaidRatio(res.data));

    axios.get(`${API_BASE}/revenue-by-fee-type`, {
      params: { month, year }
    }).then(res => setRevenueByFeeType(res.data));

    axios.get(`${API_BASE}/overdue`).then(res => setOverdueInvoices(res.data));

    axios.get(`${PAY_API_BASE}/total-by-method`, {
      params: { month, year }
    }).then(res => setTotalByMethod(res.data));
  }, [periodType, month, quarter, year]);

  // Bar chart: Doanh thu theo kỳ
  const revenuePeriodChart = {
    labels: revenueByPeriod.map(r =>
      periodType === "MONTH" ? `Tháng ${r.month}/${r.year}` :
      periodType === "QUARTER" ? `Quý ${r.quarter}/${r.year}` :
      `Năm ${r.year}`
    ),
    datasets: [{
      label: "Tổng doanh thu (VNĐ)",
      data: revenueByPeriod.map(r => r.total_revenue),
      backgroundColor: "#f9bc60"
    }]
  };

  // Pie chart: Tỷ lệ hóa đơn đã thanh toán
  const paidRatioChart = {
    labels: paidRatio.map(i => i.is_paid ? "Đã thanh toán" : "Chưa thanh toán"),
    datasets: [{
      data: paidRatio.map(i => i.total),
      backgroundColor: ["#abd1c6", "#e16162"]
    }]
  };

  // Doughnut chart: Doanh thu theo loại phí
  const feeTypeChart = {
    labels: revenueByFeeType.map(i => i.fee_type),
    datasets: [{
      label: "Doanh thu",
      data: revenueByFeeType.map(i => i.total_revenue),
      backgroundColor: ["#f9bc60", "#abd1c6", "#e16162", "#004643", "#001e1d"]
    }]
  };

  // Bar chart: Tổng tiền đã thanh toán theo phương thức
  const methodChart = {
    labels: totalByMethod.map(i => i.payment_method),
    datasets: [{
      label: "Tổng tiền (VNĐ)",
      data: totalByMethod.map(i => i.total_paid),
      backgroundColor: ["#f9bc60", "#abd1c6", "#e16162", "#004643", "#001e1d"]
    }]
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Báo cáo doanh thu & lợi nhuận</h2>
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
            <h5>Doanh thu theo kỳ</h5>
            <Bar data={revenuePeriodChart} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Tỷ lệ hóa đơn đã thanh toán</h5>
            <Pie data={paidRatioChart} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Doanh thu theo loại phí</h5>
            <Doughnut data={feeTypeChart} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5>Tổng tiền đã thanh toán theo phương thức</h5>
            <Bar data={methodChart} />
          </div>
        </div>
        <div className="col-md-12 mb-4">
          <div className="card p-3">
            <h5>Hóa đơn quá hạn thanh toán</h5>
            <ul>
              {overdueInvoices.length === 0 && <li>Không có hóa đơn quá hạn</li>}
              {overdueInvoices.map(inv => (
                <li key={inv.invoice_id}>
                  {inv.room_number} - Tháng {inv.month?.slice(0,7)} - Số tiền: {Number(inv.total_amount).toLocaleString()}đ
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}