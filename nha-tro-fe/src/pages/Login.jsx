import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css"; // Import your custom CSS for styles
export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // bật loading
    try {
      const res = await axios.post("http://localhost:8000/auth/login", form);
      if (res.data?.access_token && res.data?.user) {
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      } else {
        setError("Phản hồi từ server không hợp lệ.");
      }
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail || "Đăng nhập thất bại.");
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false); // tắt loading
    }
  };

  return (
    <div className="login-wrapper">
      {/* Carousel Background */}
      <div
        id="bgCarousel"
        className="carousel slide position-absolute top-0 start-0 w-100 h-100"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner h-100 w-100">
          {[1, 2, 3].map((n, i) => (
            <div
              key={n}
              className={`carousel-item h-100 w-100 ${i === 0 ? "active" : ""}`}
            >
              <img
                src={`/images/bg${n}.jpg`}
                className="d-block w-100 h-100"
                alt={`Slide ${n}`}
                style={{
                  objectFit: "cover",
                  filter: "brightness(60%)",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Login Form */}
      <div className="container d-flex align-items-center justify-content-center min-vh-100 position-relative">
        <div
          className="card shadow-lg p-4 bg-opacity-75"
          style={{
              width: "100%",
              maxWidth: "400px",
              borderRadius: "1rem",
              backgroundColor: "rgba(145, 145, 145, 0.73)", // trắng mờ hơn
              backdropFilter: "blur(0px)",               // hiệu ứng mờ nền sau (nếu muốn)
              WebkitBackdropFilter: "blur(0px)",         // hỗ trợ Safari
            }}
        >
          <h3 className="text-center text-warning fw-bold mb-3">
            Đăng nhập hệ thống
          </h3>

          {error && (
            <div className="alert alert-danger text-center py-2">{error}</div>
          )}

         <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-4">Nhập thông tin phòng</h5>
              <form>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Số phòng</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.room_number}
                      onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Tầng</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.floor_number}
                      onChange={(e) => setForm({ ...form, floor_number: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Số người tối đa</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.max_occupants}
                      onChange={(e) => setForm({ ...form, max_occupants: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Mã loại phòng (room_type_id)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.room_type_id}
                      onChange={(e) => setForm({ ...form, room_type_id: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-control"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="col-12">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isAvailable"
                        checked={form.is_available}
                        onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="isAvailable">
                        Còn trống
                      </label>
                    </div>
                  </div>
                </div>
              </form>
          </div>
        </div>
          <p className="text-center text-white mt-4 mb-0" style={{ fontSize: "0.9rem" }}>
            Chưa có tài khoản?{" "}
            <a href="/register" className="text-warning text-decoration-none">
              Đăng ký
            </a>
          </p>
          <p className="text-center text-white mt-2 mb-0" style={{ fontSize: "0.9rem" }}>
            © {new Date().getFullYear()} Nhà Trọ Bảo Bảo. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}