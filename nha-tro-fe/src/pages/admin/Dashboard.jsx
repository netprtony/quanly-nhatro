import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_rooms: 0,
    rented_rooms: 0,
    total_contracts: 0,
    total_tenants: 0,
    total_invoices: 0,
    paid_invoices: 0,
    unpaid_invoices: 0,
    total_payments: 0,
    total_revenue: 0,
  });

  useEffect(() => {
    fetch("http://localhost:8000/report/summary")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats({ ...stats }));
  }, []);

  return (
    <>
      <h2 className="mb-4">Tổng quan hệ thống</h2>
      <div className="row">
        <div className="col-md-3">
          <div className="card shadow-sm p-3">
            <h5>Tổng số phòng</h5>
            <p className="fs-3 fw-bold text-primary">{stats.total_rooms}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3">
            <h5>Phòng đang thuê</h5>
            <p className="fs-3 fw-bold text-success">{stats.rented_rooms}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3">
            <h5>Khách thuê</h5>
            <p className="fs-3 fw-bold text-info">{stats.total_tenants}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3">
            <h5>Doanh thu</h5>
            <p className="fs-3 fw-bold text-warning">
              {stats.total_revenue.toLocaleString("vi-VN")}₫
            </p>
          </div>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card shadow-sm p-3">
            <h5>Tổng hợp đồng</h5>
            <p className="fs-3 fw-bold">{stats.total_contracts}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3">
            <h5>Hóa đơn đã thanh toán</h5>
            <p className="fs-3 fw-bold text-success">{stats.paid_invoices}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3">
            <h5>Hóa đơn chưa thanh toán</h5>
            <p className="fs-3 fw-bold text-danger">{stats.unpaid_invoices}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3">
            <h5>Số lần thanh toán</h5>
            <p className="fs-3 fw-bold">{stats.total_payments}</p>
          </div>
        </div>
      </div>
    </>
  );
}
