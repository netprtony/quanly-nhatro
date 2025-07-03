import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Email không hợp lệ.");
      return false;
    }

    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp.");
      return false;
    }

    return true;
  };
 const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      await axios.post("http://localhost:8000/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      alert("Đăng ký thành công!");
      navigate("/");
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Đăng ký thất bại. Vui lòng thử lại sau.");
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

      {/* Register Form */}
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
            Đăng ký tài khoản
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

            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />
              <label htmlFor="email">Email</label>
            </div>

            <div className="form-floating mb-3">
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

            <div className="form-floating mb-4">
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                required
              />
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            </div>

            <button
              type="submit"
              className="btn btn-warning w-100 py-2 fs-5 fw-semibold"
            >
              Đăng ký
            </button>
          </form>

          <p className="text-center text-white mt-4 mb-0" style={{ fontSize: "0.9rem" }}>
            Đã có tài khoản?{" "}
            <a href="/login" className="text-warning text-decoration-none">
              Đăng nhập
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