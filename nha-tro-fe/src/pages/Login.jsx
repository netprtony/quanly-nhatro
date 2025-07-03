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

          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                required
              />
              <label htmlFor="username">Tài khoản</label>
            </div>

            <div className="form-floating mb-4">
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />
              <label htmlFor="password">Mật khẩu</label>
            </div>

            <button
              type="submit"
              className="btn btn-warning w-100 py-2 fs-5 fw-semibold d-flex align-items-center justify-content-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span class="loader"></span>
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

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