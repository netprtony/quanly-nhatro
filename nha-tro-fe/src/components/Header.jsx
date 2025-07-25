import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navbar,
  Nav,
  Form,
  FormControl,
  Button,
  Container,
} from "react-bootstrap";
import { FaAngleDown } from "react-icons/fa";
import { useUser } from "../contexts/UserContext";
import Modal from "./Modal.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Header() {
  const navigate = useNavigate();
  const { currentUser, logout } = useUser();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  // Lấy token từ localStorage mỗi lần đổi mật khẩu
  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.dropdown-user-header')) setDropdownOpen(false);
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleOpenProfile = () => {
    setShowProfile(true);
  };

  const handleOpenChangePassword = () => {
    setShowChangePassword(true);
    setShowProfile(false);
  };

  // Tích hợp API đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          old_password: passwordForm.oldPassword,
          new_password: passwordForm.newPassword,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Đổi mật khẩu thất bại!");
      }
      setShowChangePassword(false);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("✅ Đổi mật khẩu thành công!");
    } catch (err) {
      toast.error(err.message || "Đổi mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Navbar
        expand="lg"
        style={{ backgroundColor: "#004643" }}
        variant="dark"
        className="shadow"
      >
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold" style={{ color: "#f9bc60" }}>
            🏠 Nhà Trọ Bảo Bảo
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/rooms" style={{ color: "#ffffff" }}>Phòng</Nav.Link>
              <Nav.Link as={Link} to="/contracts" style={{ color: "#ffffff" }}>Hợp đồng</Nav.Link>
              <Nav.Link as={Link} to="/payments" style={{ color: "#ffffff" }}>Thanh toán</Nav.Link>
              <Nav.Link as={Link} to="/support" style={{ color: "#ffffff" }}>Hỗ trợ</Nav.Link>
            </Nav>

            <Form className="d-flex me-3">
              <FormControl
                type="search"
                placeholder="Tìm kiếm"
                className="me-2"
                style={{
                  backgroundColor: "#abd1c6",
                  border: "none",
                  color: "#001e1d",
                  fontWeight: "500",
                }}
              />
              <Button
                variant="light"
                style={{ backgroundColor: "#f9bc60", color: "#001e1d", border: "none" }}
              >
                Tìm
              </Button>
            </Form>

            <AnimatePresence mode="wait">
              {!currentUser ? (
                <motion.div
                  key="auth-menu"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    variant="outline-light"
                    className="me-2"
                    onClick={() => handleNavigate("/login")}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    variant="warning"
                    onClick={() => handleNavigate("/register")}
                  >
                    Đăng ký
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="user-avatar"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="dropdown dropdown-user-header d-inline-block position-relative">
                    <Button
                      variant="link"
                      className="text-white d-flex align-items-center"
                      style={{ textDecoration: "none" }}
                      onClick={() => setDropdownOpen((open) => !open)}
                    >
                      <span style={{ color: "#ffffff" }}>
                        👤 {currentUser?.username || "User"}
                      </span>
                      <FaAngleDown className="ms-1" />
                    </Button>
                    <ul
                      className={`dropdown-menu dropdown-menu-end${dropdownOpen ? " show" : ""}`}
                      style={{ position: "absolute", top: "100%", right: 0, zIndex: 1000 }}
                    >
                      <li>
                        <button className="dropdown-item" onClick={() => { setShowProfile(true); setDropdownOpen(false); }}>
                          Thông tin cá nhân
                        </button>
                      </li>
                      <li>
                        <button className="dropdown-item" onClick={() => { setShowChangePassword(true); setDropdownOpen(false); }}>
                          Đổi mật khẩu
                        </button>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                          Đăng xuất
                        </button>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Modal Thông tin cá nhân */}
      <Modal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        title="👤 Thông tin cá nhân"
        showConfirm={false}
      >
        {currentUser ? (
          <div>
            <div className="mb-2"><b>Tên đăng nhập:</b> {currentUser.username}</div>
            <div className="mb-2"><b>Họ tên:</b> {currentUser.full_name}</div>
            <div className="mb-2"><b>Email:</b> {currentUser.email}</div>
            <div className="mb-2"><b>Quyền:</b> {currentUser.role}</div>
            <button className="btn btn-link p-0" onClick={() => { setShowProfile(false); setShowChangePassword(true); }}>
              Đổi mật khẩu
            </button>
          </div>
        ) : (
          <div>Không có thông tin người dùng.</div>
        )}
      </Modal>

      {/* Modal Đổi mật khẩu */}
      <Modal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        title="🔒 Đổi mật khẩu"
        showConfirm={false}
      >
        <form onSubmit={handleChangePassword}>
          <div className="mb-3">
            <label className="form-label">Mật khẩu cũ</label>
            <input
              type="password"
              className="form-control"
              value={passwordForm.oldPassword}
              onChange={e => setPasswordForm(f => ({ ...f, oldPassword: e.target.value }))}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mật khẩu mới</label>
            <input
              type="password"
              className="form-control"
              value={passwordForm.newPassword}
              onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Nhập lại mật khẩu mới</label>
            <input
              type="password"
              className="form-control"
              value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
        </form>
      </Modal>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick={true} rtl={false} pauseOnFocusLoss={true} draggable={true} pauseOnHover={true} />
    </motion.div>
  );
}
