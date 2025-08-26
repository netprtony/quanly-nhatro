import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaBed,
  FaRulerCombined,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const ROOM_API = "http://localhost:8000/rooms";
const ROOM_IMAGE_API = "http://localhost:8000/room-images";

export default function DetailRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [images, setImages] = useState([]);
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    fetch(`${ROOM_API}/${roomId}`)
      .then((res) => res.json())
      .then((data) => setRoom(data));
    fetch(`${ROOM_IMAGE_API}/?room_id=${roomId}`)
      .then((res) => res.json())
      .then((data) => setImages(data));
  }, [roomId]);

  if (!room) {
    return (
      <div className="container py-5 text-center text-light">
        <div className="alert alert-danger">Không tìm thấy phòng!</div>
        <button className="btn btn-warning" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #004643 0%, #001e1d 100%)",
        padding: "40px 0",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-11">
            <div
              className="rounded-4 shadow-lg overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "2px solid #f9bc60",
              }}
            >
              {/* Ảnh phòng */}
              <div className="bg-dark position-relative">
                <div
                  id="roomCarousel"
                  className="carousel slide"
                  data-bs-ride="carousel"
                >
                  <div className="carousel-inner">
                    {images.length > 0 ? (
                      images.map((img, idx) => (
                        <div
                          key={idx}
                          className={`carousel-item ${idx === 0 ? "active" : ""}`}
                        >
                          <img
                            src={img.image_url || img.image_path}
                            className="d-block w-100"
                            alt={`Ảnh ${idx + 1}`}
                            style={{
                              height: "600px",
                              width: "1200px",
                              objectFit: "cover",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              setLightboxImg(img.image_url || img.image_path)
                            }
                          />
                        </div>
                      ))
                    ) : (
                      <div className="carousel-item active">
                        <img
                          src="https://via.placeholder.com/1200x600?text=No+Image"
                          className="d-block w-100"
                          alt="No image"
                          style={{ height: "600px", objectFit: "cover" }}
                        />
                      </div>
                    )}
                  </div>
                  {images.length > 1 && (
                    <>
                      <button
                        className="carousel-control-prev"
                        type="button"
                        data-bs-target="#roomCarousel"
                        data-bs-slide="prev"
                      >
                        <span className="carousel-control-prev-icon"></span>
                      </button>
                      <button
                        className="carousel-control-next"
                        type="button"
                        data-bs-target="#roomCarousel"
                        data-bs-slide="next"
                      >
                        <span className="carousel-control-next-icon"></span>
                      </button>
                    </>
                  )}
                </div>
                <span
                  className="position-absolute top-0 end-0 m-3 px-3 py-1 rounded-pill"
                  style={{
                    background: "#f9bc60",
                    color: "#001e1d",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                  }}
                >
                  Phòng {room.room_number}
                </span>
              </div>

              {/* Thông tin phòng */}
              <div className="p-5">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-3">
                      <FaBed className="me-2" style={{ color: "#f9bc60" }} />
                      <span className="fw-bold me-2" style={{ color: "#f9bc60" }}>
                        Loại phòng:
                      </span>
                      <span>{room.type_name}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <FaRulerCombined className="me-2" style={{ color: "#abd1c6" }} />
                      <span className="fw-bold me-2" style={{ color: "#abd1c6" }}>
                        Diện tích:
                      </span>
                      <span>{room.area} m²</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-3">
                      <FaMoneyBillWave className="me-2" style={{ color: "#f9bc60" }} />
                      <span className="fw-bold me-2" style={{ color: "#f9bc60" }}>
                        Giá thuê:
                      </span>
                      <span
                        style={{ color: "#f9bc60", fontWeight: 700, fontSize: "1.2rem" }}
                      >
                        {room.price_per_month?.toLocaleString("vi-VN")} đ/tháng
                      </span>
                    </div>
                    <div className="d-flex align-items-center">
                      {room.is_available ? (
                        <>
                          <FaCheckCircle className="me-2 text-success" />
                          <span className="fw-bold text-success">Còn trống</span>
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="me-2 text-secondary" />
                          <span className="fw-bold text-secondary">Đã thuê</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mô tả phòng */}
                <div
                  className="p-4 rounded-3 mb-4"
                  style={{
                    background: "rgba(249, 188, 96, 0.1)",
                    border: "1px solid #f9bc60",
                    fontSize: "1.1rem",
                    color: "#eee",
                  }}
                >
                  <FaInfoCircle className="me-2" style={{ color: "#f9bc60" }} />
                  <span style={{ fontWeight: 600, color: "#f9bc60" }}>Mô tả: </span>
                  {room.description || <span className="text-muted">Chưa có mô tả</span>}
                </div>

                {/* Nút điều hướng */}
                <div className="d-flex justify-content-center gap-3 mt-4">
                  <button
                    className="btn btn-outline-warning px-4"
                    onClick={() => navigate(-1)}
                  >
                    Quay lại
                  </button>
                  {room.is_available ? (
                    <button
                      className="btn btn-warning text-dark fw-bold px-4"
                      onClick={() => alert("Liên hệ quản lý để đặt phòng!")}
                    >
                      Đặt phòng
                    </button>
                  ) : (
                    <button className="btn btn-secondary px-4" disabled>
                      Đã thuê
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Lightbox */}
      {lightboxImg && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
          tabIndex="-1"
          onClick={() => setLightboxImg(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content bg-transparent border-0">
              <img
                src={lightboxImg}
                alt="Zoom"
                className="img-fluid rounded"
                style={{
                  maxHeight: "85vh",
                  objectFit: "contain",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
