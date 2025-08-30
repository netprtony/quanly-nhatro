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
            maxWidth: "1400px", // tăng chiều ngang khung chứa
            background: "rgba(171, 209, 198, 0.13)",
            border: "2px solid #f9bc60",
            color: "#fff",
          }}
        >
          <div className="card-body">
            {/* Hiển thị PDF nếu có */}
            {contract.path_contract && (
              <div className="mt-4">
                <div className="fw-bold mb-2 text-center text-warning">📄 Hợp đồng PDF</div>
                <div className="mb-3 text-center">
                  <iframe
                    src={contract.path_contract}
                    title="Hợp đồng PDF"
                    width="100%"
                    height="900px"
                    style={{
                      border: "2px solid #f9bc60",
                      borderRadius: "12px",
                      background: "#fff",
                      minWidth: "600px",
                      width: "100%",
                      maxWidth: "none", // bỏ giới hạn chiều ngang
                    }}
                  />
                </div>
                <div className="text-center">
                  <a
                    href={contract.path_contract}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-warning fw-bold"
                    style={{ fontSize: "1.1rem" }}
                    download
                  >
                    📥 Tải hợp đồng PDF
                  </a>
                </div>
              </div>
            )}
            </div>

        </div>
      </div>
    </div>
  );
}