import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaBed, FaRulerCombined, FaMoneyBillWave, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// Thêm trường image cho mỗi phòng (có thể dùng ảnh minh họa online hoặc local assets)
const mockRooms = [
  {
    id: 1,
    name: "Phòng 101",
    type: "Đơn",
    area: 18,
    price: 1800000,
    status: "Còn trống",
    description: "Phòng sạch sẽ, có cửa sổ lớn, gần cầu thang.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Phòng 102",
    type: "Đôi",
    area: 22,
    price: 2200000,
    status: "Đã thuê",
    description: "Phòng rộng, có ban công, view đẹp.",
    image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "Phòng 201",
    type: "Đơn",
    area: 16,
    price: 1700000,
    status: "Còn trống",
    description: "Phòng yên tĩnh, phù hợp sinh viên.",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "Phòng 202",
    type: "Gia đình",
    area: 28,
    price: 3000000,
    status: "Đã thuê",
    description: "Phòng lớn, có bếp riêng, phù hợp gia đình nhỏ.",
    image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "Phòng 202",
    type: "Gia đình",
    area: 28,
    price: 3000000,
    status: "Đã thuê",
    description: "Phòng lớn, có bếp riêng, phù hợp gia đình nhỏ.",
    image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "Phòng 202",
    type: "Gia đình",
    area: 28,
    price: 3000000,
    status: "Đã thuê",
    description: "Phòng lớn, có bếp riêng, phù hợp gia đình nhỏ.",
    image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "Phòng 202",
    type: "Gia đình",
    area: 28,
    price: 3000000,
    status: "Đã thuê",
    description: "Phòng lớn, có bếp riêng, phù hợp gia đình nhỏ.",
    image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "Phòng 202",
    type: "Gia đình",
    area: 28,
    price: 3000000,
    status: "Đã thuê",
    description: "Phòng lớn, có bếp riêng, phù hợp gia đình nhỏ.",
    image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80",
  },
];

const ROOMS_PER_PAGE = 6;

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const topRef = useRef(null);

  useEffect(() => {
    // Thay bằng API thực tế nếu có
    setRooms(mockRooms);
  }, []);

  // Tính toán phân trang
  const totalPages = Math.ceil(rooms.length / ROOMS_PER_PAGE);
  const pagedRooms = rooms.slice(
    (currentPage - 1) * ROOMS_PER_PAGE,
    currentPage * ROOMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll lên đầu danh sách phòng khi đổi trang
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #004643 0%, #001e1d 100%)",
        paddingTop: "40px",
        paddingBottom: "40px",
      }}
    >
      <motion.div
        className="container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div ref={topRef}></div>
        <h2
          className="fw-bold mb-4 text-center"
          style={{ color: "#f9bc60", letterSpacing: "1px" }}
        >
          Danh sách phòng trọ
        </h2>
        <div className="row g-4">
          {pagedRooms.map((room) => (
            <motion.div
              key={room.id}
              className="col-12 col-md-6 col-lg-4"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="shadow glass-card h-100"
                style={{
                  background: "rgba(171, 209, 198, 0.13)",
                  borderRadius: "18px",
                  border: "1.5px solid #f9bc60",
                  color: "#fff",
                  padding: "0.5rem 0.5rem 1.5rem 0.5rem",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 420,
                }}
              >
                <div style={{ borderRadius: "14px", overflow: "hidden", marginBottom: 12 }}>
                  <img
                    src={room.image}
                    alt={room.name}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "14px",
                      border: "2px solid #abd1c6",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  />
                </div>
                <div className="d-flex align-items-center mb-2">
                  <FaBed size={22} style={{ color: "#f9bc60", marginRight: 8 }} />
                  <span className="fs-6 fw-bold" style={{ color: "#f9bc60" }}>
                    {room.name}
                  </span>
                  <span
                    className={`badge ms-auto ${room.status === "Còn trống" ? "bg-success" : "bg-secondary"}`}
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      padding: "0.4em 1em",
                      borderRadius: "12px",
                    }}
                  >
                    {room.status === "Còn trống" ? (
                      <>
                        <FaCheckCircle className="me-1" /> Còn trống
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="me-1" /> Đã thuê
                      </>
                    )}
                  </span>
                </div>
                <div className="mb-2" style={{ color: "#ffffffff", fontWeight: 600 }}>
                  <FaRulerCombined className="me-2" style={{ color: "#ffffffff" }} />
                  Diện tích: <span style={{ color: "#ffffffff" }}>{room.area} m²</span>
                </div>
                <div className="mb-2" style={{ color: "#ffffffff", fontWeight: 600 }}>
                  <FaMoneyBillWave className="me-2" style={{ color: "#f9bc60" }} />
                  Giá thuê:{" "}
                  <span style={{ color: "#f9bc60" }}>
                    {room.price.toLocaleString("vi-VN")} đ/tháng
                  </span>
                </div>
                <div className="mb-3" style={{ color: "#abd1c6" }}>
                  {room.description}
                </div>
                <div className="d-flex justify-content-end mt-auto">
                  {room.status === "Còn trống" ? (
                    <button
                      className="btn"
                      style={{
                        background: "#f9bc60",
                        color: "#001e1d",
                        fontWeight: 600,
                        borderRadius: "8px",
                        padding: "0.5em 1.5em",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                        border: "none",
                      }}
                      onClick={() => alert("Liên hệ quản lý để đặt phòng!")}
                    >
                      Đặt phòng
                    </button>
                  ) : (
                    <button
                      className="btn"
                      style={{
                        background: "#abd1c6",
                        color: "#888",
                        fontWeight: 600,
                        borderRadius: "8px",
                        padding: "0.5em 1.5em",
                        border: "none",
                        cursor: "not-allowed",
                      }}
                      disabled
                    >
                      Đã thuê
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="d-flex justify-content-center mt-4">
            <ul className="pagination" style={{ background: "transparent" }}>
              <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
                <button
                  className="page-link"
                  style={{
                    background: "#abd1c6",
                    color: "#004643",
                    border: "none",
                    marginRight: 4,
                  }}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &laquo;
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li
                  key={i}
                  className={`page-item${currentPage === i + 1 ? " active" : ""}`}
                >
                  <button
                    className="page-link"
                    style={{
                      background: currentPage === i + 1 ? "#f9bc60" : "#abd1c6",
                      color: currentPage === i + 1 ? "#001e1d" : "#004643",
                      border: "none",
                      marginRight: 4,
                    }}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item${currentPage === totalPages ? " disabled" : ""}`}>
                <button
                  className="page-link"
                  style={{
                    background: "#abd1c6",
                    color: "#004643",
                    border: "none",
                  }}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  &raquo;
                </button>
              </li>
            </ul>
          </nav>
        )}
      </motion.div>
    </div>
  );
}