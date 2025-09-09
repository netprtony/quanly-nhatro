import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaBed, FaRulerCombined, FaMoneyBillWave, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AdvancedFilters from "/src/components/AdvancedFilters"; // Import component lọc nâng cao

const ROOM_API = "http://localhost:8000/rooms";
const ROOMTYPE_API = "http://localhost:8000/roomtypes/";

const ROOMS_PER_PAGE = 6;

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const [filters, setFilters] = useState([]);
  const [search, setSearch] = useState("");
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
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (filters.length > 0) {
      // Gọi API lọc nâng cao (POST)
      fetch(`${ROOM_API}/filter?page=${currentPage}&page_size=${ROOMS_PER_PAGE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters }),
      })
        .then(res => res.json())
        .then(data => {
          setRooms(data.items || []);
          setTotalRooms(data.total || 0);
        });
    } else {
      // Gọi API thường (GET)
      fetch(url)
        .then(res => res.json())
        .then(data => {
          setRooms(data.items || []);
          setTotalRooms(data.total || 0);
        });
    }
  }, [currentPage, selectedType, filters, search]);

  const totalPages = Math.ceil(totalRooms / ROOMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const fieldOptions = [
    { value: "room_number", label: "Số phòng" },
    { value: "max_occupancy", label: "Số người tối đa" },
    { value: "price_per_month", label: "Giá thuê/tháng" },
    { value: "type_name", label: "Loại phòng" },
    { value: "floor_number", label: "Tầng" },
    { value: "is_available", label: "Trạng thái phòng"}
  ];

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
        
        {/* Thêm component lọc nâng cao */}
        <AdvancedFilters
          fieldOptions={fieldOptions}
          filters={filters}
          onAddFilter={f => {
            setFilters(prev => [...prev, f]);
            setCurrentPage(1);
          }}
          onRemoveFilter={i => {
            setFilters(prev => prev.filter((_, idx) => idx !== i));
            setCurrentPage(1);
          }}
          onSearch={term => {
            setSearch(term);
            setCurrentPage(1);
          }}
          onLoad={() => {}}
          onExportCSV={() => {}}
          onExportJSON={() => {}}
        />
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
                    src={
                      room.roomImage && room.roomImage.length > 0
                        ? room.roomImage[0]
                        : "/roomImage/Data Not Available.png"
                    }
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
                  Số người tối đa: <span style={{ color: "#ffffffff" }}>{room.max_occupants} người</span>
                </div>
                
                <div className="mb-2" style={{ color: "#ffffffff", fontWeight: 600 }}>
                  <FaMoneyBillWave className="me-2" style={{ color: "#f9bc60" }} />
                  Giá thuê:{" "}
                  <span style={{ color: "#f9bc60" }}>
                    {room.room_type.price_per_month?.toLocaleString("vi-VN") || "N/A"} đ/tháng
                  </span>
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