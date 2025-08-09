import React, { useState } from "react";
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

// Dữ liệu mẫu
const mockRooms = [
  {
    id: 1,
    name: "Phòng 101",
    type: "Đơn",
    area: 18,
    price: 1800000,
    status: "Còn trống",
    description: "Phòng sạch sẽ, có cửa sổ lớn, gần cầu thang.",
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 2,
    name: "Phòng 102",
    type: "Đôi",
    area: 22,
    price: 2200000,
    status: "Đã thuê",
    description: "Phòng rộng, có ban công, view đẹp.",
    images: [
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

export default function DetailRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [lightboxImg, setLightboxImg] = useState(null);

  const room = mockRooms.find((r) => String(r.id) === String(roomId));

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
        paddingTop: "40px",
        paddingBottom: "40px",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div
              className="p-4 rounded"
              style={{
                background: "rgba(171, 209, 198, 0.08)",
                border: "1.5px solid #f9bc60",
                color: "#fff",
              }}
            >
              {/* Carousel Bootstrap */}
              <div
                id="roomCarousel"
                className="carousel slide"
                data-bs-ride="carousel"
              >
                <div className="carousel-inner">
                  {room.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`carousel-item ${idx === 0 ? "active" : ""}`}
                    >
                      <img
                        src={img}
                        className="d-block w-100 rounded"
                        alt={`Ảnh ${idx + 1}`}
                        style={{ height: "350px", objectFit: "cover" }}
                        onClick={() => setLightboxImg(img)}
                      />
                    </div>
                  ))}
                </div>
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
              </div>

              {/* Thông tin phòng */}
              <h2 className="fw-bold mt-4 mb-3" style={{ color: "#f9bc60" }}>
                {room.name}
              </h2>

              <div className="row text-light mb-3">
                <div className="col-md-6 mb-2">
                  <FaBed className="me-2" /> Loại phòng:{" "}
                  <b>{room.type}</b>
                </div>
                <div className="col-md-6 mb-2">
                  <FaRulerCombined className="me-2" /> Diện tích:{" "}
                  <b>{room.area} m²</b>
                </div>
                <div className="col-md-6 mb-2">
                  <FaMoneyBillWave className="me-2" /> Giá thuê:{" "}
                  <b style={{ color: "#f9bc60" }}>
                    {room.price.toLocaleString("vi-VN")} đ/tháng
                  </b>
                </div>
                <div className="col-md-6 mb-2">
                  {room.status === "Còn trống" ? (
                    <>
                      <FaCheckCircle className="me-2 text-success" />{" "}
                      <b className="text-success">Còn trống</b>
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="me-2 text-secondary" />{" "}
                      <b className="text-secondary">Đã thuê</b>
                    </>
                  )}
                </div>
              </div>

              {/* Mô tả */}
              <div
                className="p-3 rounded mb-3"
                style={{
                  background: "rgba(249, 188, 96, 0.08)",
                  border: "1px solid rgba(249, 188, 96, 0.3)",
                  color: "#abd1c6",
                }}
              >
                <FaInfoCircle className="me-2 text-warning" />
                {room.description}
              </div>

              {/* Nút */}
              <div className="d-flex justify-content-between">
                <button
                  className="btn btn-outline-warning"
                  onClick={() => navigate(-1)}
                >
                  Quay lại
                </button>
                {room.status === "Còn trống" ? (
                  <button
                    className="btn btn-warning text-dark fw-bold"
                    onClick={() => alert("Liên hệ quản lý để đặt phòng!")}
                  >
                    Đặt phòng
                  </button>
                ) : (
                  <button className="btn btn-secondary" disabled>
                    Đã thuê
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Lightbox */}
      {lightboxImg && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" , backdropFilter: "blur(4px)"}}
          tabIndex="-1"
          onClick={() => setLightboxImg(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-transparent border-0">
              <img
                src={lightboxImg}
                alt="Zoom"
                className="img-fluid rounded"
                style={{
                  maxHeight: "80vh",
                  objectFit: "contain",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
