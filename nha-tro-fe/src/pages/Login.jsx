import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/auth/login", form);
      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
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
          className="card shadow-lg p-4 bg-white bg-opacity-75"
          style={{ width: "100%", maxWidth: "400px", borderRadius: "1rem" }}
        >
          <h3 className="text-center text-primary fw-bold mb-3">
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
              className="btn btn-primary w-100 py-2 fs-5 fw-semibold"
            >
              Đăng nhập
            </button>
          </form>

          <p className="text-center text-muted mt-4 mb-0" style={{ fontSize: "0.9rem" }}>
            Chưa có tài khoản?{" "}
            <a href="/register" className="text-primary text-decoration-none">
              Đăng ký
            </a>
          </p>
          <p className="text-center text-muted mt-2 mb-0" style={{ fontSize: "0.9rem" }}>
            © {new Date().getFullYear()} Nhà Trọ Admin
          </p>
        </div>
      </div>
    </div>
  );
}