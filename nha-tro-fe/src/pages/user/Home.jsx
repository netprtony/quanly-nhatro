import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import "/src/assets/style/Home.css"; // CSS đã chỉnh màu

const TENANT_API = "http://localhost:8000/tenants/from-user/";

const features = [
  {
    title: "Xem phòng",
    description: "Xem danh sách phòng còn trống, chi tiết và giá thuê.",
    icon: "🛏️",
    link: "/rooms",
  },
  {
    title: "Hợp đồng",
    description: "Xem hợp đồng thuê nhà, thời hạn và thông tin liên quan.",
    icon: "📄",
    link: "/contracts",
  },
  {
    title: "Thanh toán",
    description: "Xem và thanh toán hóa đơn tiền trọ, điện, nước.",
    icon: "💵",
    link: "/invoices",
  },
  {
    title: "Lịch sử thanh toán",
    description: "Xem lịch sử thanh toán tiền trọ, điện, nước.",
    icon: "📊",
    link: "/history-payment",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const isLoggedIn = localStorage.getItem("token");
  const [tenantInfo, setTenantInfo] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.id) {
        fetch(`${TENANT_API}${user.id}`)
          .then((res) => res.json())
          .then((data) => setTenantInfo(data))
          .catch(() => setTenantInfo(null));
      }
    }
  }, [isLoggedIn]);

  const handleAccess = (link) => {
    navigate(isLoggedIn ? link : "/login");
  };

  if (isLoggedIn) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return (
      <div className="home-wrapper">
        <motion.div
          className="background-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <div className="container py-5 position-relative z-2">
          <div className="row justify-content-center" ref={ref}>
            {/* Thông tin cá nhân nằm riêng phía trên, to hơn */}
            <motion.div
              className="col-12 mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
            >
              <div
                className="glass-card text-center h-100 p-4 shadow border border-warning"
                style={{
                  background: "#f9bc60",
                  color: "#001e1d",
                  fontSize: "1.15rem",
                  maxWidth: 600,
                  margin: "0 auto",
                }}
              >
                <motion.div
                  className="display-3 mb-2"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  👤
                </motion.div>
                <h4 className="fw-bold mb-3" style={{ color: "#001e1d" }}>
                  Thông tin cá nhân
                </h4>
                <div style={{ color: "#001e1d" }}>
                  {tenantInfo ? (
                    <>
                      <div>
                        <b>Họ tên:</b> {tenantInfo.full_name}
                      </div>
                      <div>
                        <b>Số CCCD:</b> {tenantInfo.tenant_id}
                      </div>
                      <div>
                        <b>Email:</b> {user.email}
                      </div>
                      <div>
                        <b>SĐT:</b> {tenantInfo.phone_number}
                      </div>
                      <div>
                        <b>Ngày sinh:</b> {tenantInfo.date_of_birth}
                      </div>
                      <div>
                        <b>Giới tính:</b> {tenantInfo.gender}
                      </div>
                      <div>
                        <b>Đang thuê:</b> {tenantInfo.is_rent ? "Có" : "Không"}
                      </div>
                    </>
                  ) : (
                    <span className="text-muted">Chưa cập nhật thông tin</span>
                  )}
                </div>
              </div>
            </motion.div>
            {/* Các feature còn lại */}
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="col-md-6 col-lg-3 mb-4"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.2 }}
              >
                <div className="glass-card text-center h-100 p-3 shadow">
                  <motion.div
                    className="display-4 mb-2"
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h5 className="fw-semibold" style={{ color: "#ffffff" }}>
                    {feature.title}
                  </h5>
                  <div className="small mb-2" style={{ color: "#abd1c6" }}>
                    {feature.description}
                  </div>
                  <button
                    className="btn btn-outline-light btn-sm mt-2"
                    style={{
                      backgroundColor: "#f9bc60",
                      color: "#001e1d",
                      border: "none",
                    }}
                    onClick={() => handleAccess(feature.link)}
                  >
                    Truy cập
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-wrapper">
      <motion.div
        className="background-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      <div className="container py-5 position-relative z-2">
        <motion.h1
          className="text-center fw-bold mb-4"
          style={{ color: "#ffffff" }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          🏠 Quản lý nhà trọ Bảo Bảo
        </motion.h1>

        <motion.p
          className="text-center fs-5 mb-5"
          style={{ color: "#abd1c6" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Theo dõi phòng, hóa đơn, hợp đồng và hỗ trợ sửa chữa – tất cả trong một
          hệ thống.
        </motion.p>

        <div className="row justify-content-center" ref={ref}>
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="col-md-6 col-lg-3 mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.2 }}
            >
              <div className="glass-card text-center h-100 p-3 shadow">
                <motion.div
                  className="display-4 mb-2"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  {feature.icon}
                </motion.div>
                <h5 className="fw-semibold" style={{ color: "#ffffff" }}>
                  {feature.title}
                </h5>
                <p className="small" style={{ color: "#abd1c6" }}>
                  {feature.description}
                </p>
                <button
                  className="btn btn-outline-light btn-sm mt-2"
                  style={{
                    backgroundColor: "#f9bc60",
                    color: "#001e1d",
                    border: "none",
                  }}
                  onClick={() => handleAccess(feature.link)}
                >
                  Truy cập
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
