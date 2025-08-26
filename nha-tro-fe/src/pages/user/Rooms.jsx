import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaBed, FaRulerCombined, FaMoneyBillWave, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ROOM_API = "http://localhost:8000/rooms";
const ROOMTYPE_API = "http://localhost:8000/roomtypes";
const ROOM_IMAGE_API = "http://localhost:8000/room-images";

const ROOMS_PER_PAGE = 6;

// Gộp component hiển thị ảnh phòng vào file này
function RoomImage({ roomId }) {
  const [images, setImages] = useState([]);
  useEffect(() => {
    fetch(`${ROOM_IMAGE_API}/?room_id=${roomId}`)
      .then(res => res.json())
      .then(data => setImages(data));
  }, [roomId]);
  const imageSrc =
    images.length === 0
      ? "backend/public/roomImage/Data Not Available.png"
      : images[0].image_url || images[0].image_path;
  return (
    <div
      style={{
        borderRadius: "18px",
        overflow: "hidden",
        marginBottom: 16,
        border: "3px solid #f9bc60",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        background: "#fff",
      }}
    >
      <img
        src={imageSrc}
        alt="Phòng"
        style={{
          width: "100%",
          height: "300px",
          objectFit: "cover",
          borderRadius: "18px",
          transition: "0.3s",
        }}
      />
    </div>
  );
}

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const topRef = useRef(null);
  const navigate = useNavigate();

  // Lấy danh sách loại phòng cho combobox
  useEffect(() => {
    fetch(`${ROOMTYPE_API}?page=1&page_size=100`)
      .then(res => res.json())
      .then(data => setRoomTypes(data.items || []));
  }, []);

  // Lấy danh sách phòng có phân trang và lọc theo loại phòng
  useEffect(() => {
    let url = `${ROOM_API}/?page=${currentPage}&page_size=${ROOMS_PER_PAGE}`;
    if (selectedType) url += `&sort_field=type_name&search=${selectedType}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setRooms(data.items || []);
        setTotalRooms(data.total || 0);
      });
  }, [currentPage, selectedType]);

  const totalPages = Math.ceil(totalRooms / ROOMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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
        {/* Combobox lọc loại phòng */}
        <div className="mb-4 d-flex justify-content-center">
          <select
            className="form-select w-auto"
            value={selectedType}
            onChange={e => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
              if (topRef.current) {
                topRef.current.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            <option value="">-- Tất cả loại phòng --</option>
            {roomTypes.map(rt => (
              <option key={rt.room_type_id} value={rt.type_name}>
                {rt.type_name}
              </option>
            ))}
          </select>
        </div>
        <div className="row g-4">
          {rooms.map((room) => (
            <motion.div
              key={room.room_id}
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
                {/* Load ảnh phòng từ API room-images */}
                <RoomImage roomId={room.room_id} />
                <div className="d-flex align-items-center mb-2">
                  <FaBed size={22} style={{ color: "#f9bc60", marginRight: 8 }} />
                  <span className="fs-6 fw-bold" style={{ color: "#f9bc60" }}>
                    {room.room_number}
                  </span>
                  <span
                    className={`badge ms-auto ${room.is_available ? "bg-success" : "bg-secondary"}`}
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      padding: "0.4em 1em",
                      borderRadius: "12px",
                    }}
                  >
                    {room.is_available ? (
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
                  Số người tối đa: <span style={{ color: "#ffffffff" }}>{room.max_occupancy} người</span>
                </div>
                
                <div className="mb-2" style={{ color: "#ffffffff", fontWeight: 600 }}>
                  <FaMoneyBillWave className="me-2" style={{ color: "#f9bc60" }} />
                  Giá thuê:{" "}
                  <span style={{ color: "#f9bc60" }}>
                    {room.room_type.price_per_month?.toLocaleString("vi-VN") || "N/A"} đ/tháng
                  </span>
                </div>
                <div className="mb-3" style={{ color: "#ffffffff" }}>
                  <span style={{ fontWeight: 600, color: "#f9bc60" }}>Mô tả phòng: </span>
                  {room.description || <span className="text-muted">Chưa có mô tả</span>}
                </div>
                <div className="d-flex justify-content-end mt-auto">
                  {room.is_available ? (
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
                      onClick={() => navigate(`/rooms/${room.room_id}`)}
                    >
                      Xem chi tiết
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
      </motion.div>
      {/* Pagination đặt ngoài motion.div để không bị hiệu ứng che */}
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
    </div>
  );
}