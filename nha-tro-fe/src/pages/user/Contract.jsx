import React, { useEffect, useState } from "react";

const TENANT_API = "http://localhost:8000/tenants/from-user/";
const CONTRACT_API = "http://localhost:8000/contracts/by-tenant/";

export default function Contract() {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tenantId, setTenantId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.id) {
      fetch(`${TENANT_API}${user.id}`)
        .then(res => res.json())
        .then(data => setTenantId(data.tenant_id))
        .catch(() => setError("Không lấy được thông tin khách thuê"));
    } else {
      setError("Bạn chưa đăng nhập.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!tenantId) return;
    fetch(`${CONTRACT_API}${tenantId}`)
      .then(res => {
        if (!res.ok) throw new Error("Không tìm thấy hợp đồng");
        return res.json();
      })
      .then(data => {
        setContract(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Không tìm thấy hợp đồng cho khách này");
        setLoading(false);
      });
  }, [tenantId]);

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #004643 0%, #001e1d 100%)",
        }}
        className="d-flex align-items-center justify-content-center"
      >
        <div className="text-light fs-4">Đang tải hợp đồng...</div>
      </div>
    );
  if (error)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #004643 0%, #001e1d 100%)",
        }}
        className="d-flex align-items-center justify-content-center"
      >
        <div className="text-warning fs-4">{error}</div>
      </div>
    );
  if (!contract)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #004643 0%, #001e1d 100%)",
        }}
        className="d-flex align-items-center justify-content-center"
      >
        <div className="text-warning fs-4">Không có hợp đồng nào!</div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #004643 0%, #001e1d 100%)",
        paddingTop: "40px",
        paddingBottom: "40px",
      }}
    >
      <div className="container">
        <h2
          className="mb-4 fw-bold text-center"
          style={{ color: "#f9bc60", letterSpacing: "1px" }}
        >
          📄 Thông tin hợp đồng thuê phòng
        </h2>
        <div
          className="card shadow-lg rounded-4 mx-auto"
          style={{
            maxWidth: 600,
            background: "rgba(171, 209, 198, 0.13)",
            border: "2px solid #f9bc60",
            color: "#fff",
          }}
        >
          <div className="card-body">
            <div className="mb-3">
              <span className="fw-bold" style={{ color: "#f9bc60" }}>
                Mã hợp đồng:
              </span>{" "}
              {contract.contract_id}
            </div>
            <div className="mb-3">
              <span className="fw-bold" style={{ color: "#f9bc60" }}>
                Khách thuê:
              </span>{" "}
              {contract.full_name}
            </div>
            <div className="mb-3">
              <span className="fw-bold" style={{ color: "#f9bc60" }}>
                Phòng:
              </span>{" "}
              {contract.room_number}
            </div>
            <div className="mb-3">
              <span className="fw-bold" style={{ color: "#f9bc60" }}>
                Ngày bắt đầu:
              </span>{" "}
              {contract.start_date
                ? new Date(contract.start_date).toLocaleDateString("vi-VN")
                : ""}
            </div>
            <div className="mb-3">
              <span className="fw-bold" style={{ color: "#f9bc60" }}>
                Ngày kết thúc:
              </span>{" "}
              {contract.end_date
                ? new Date(contract.end_date).toLocaleDateString("vi-VN")
                : ""}
            </div>
            <div className="mb-3">
              <span className="fw-bold" style={{ color: "#f9bc60" }}>
                Tiền đặt cọc:
              </span>{" "}
              {contract.deposit_amount?.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </div>
            <div className="mb-3">
              <span className="fw-bold" style={{ color: "#f9bc60" }}>
                Tiền thuê hàng tháng:
              </span>{" "}
              {contract.monthly_rent?.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </div>
            <div className="mb-3">
              <span className="fw-bold" style={{ color: "#f9bc60" }}>
                Số người ở:
              </span>{" "}
              {contract.num_people}
            </div>
            <div className="mb-3">
              <span className="fw-bold" style={{ color: "#f9bc60" }}>
                Số xe gửi:
              </span>{" "}
              {contract.num_vehicles}
            </div>
            <div className="mb-3">
              <span className="fw-bold" style={{ color: "#f9bc60" }}>
                Trạng thái hợp đồng:
              </span>{" "}
              {contract.contract_status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}