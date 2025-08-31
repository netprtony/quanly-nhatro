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
import { FaAngleDown, FaBell } from "react-icons/fa";
import { useUser } from "../contexts/UserContext";
import Modal from "./Modal.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TENANT_API = "http://localhost:8000/tenants/from-user/";
const NOTIFICATION_API = "http://localhost:8000/notifications/user/";

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
  const [tenantInfo, setTenantInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Lấy token từ localStorage mỗi lần đổi mật khẩu
  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.dropdown-user-header')) setDropdownOpen(false);
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  // Khi mở modal profile, lấy thông tin tenant
  useEffect(() => {
    if (showProfile && currentUser?.id) {
      fetch(`${TENANT_API}${currentUser.id}`)
        .then(res => res.json())
        .then(data => setTenantInfo(data))
        .catch(() => setTenantInfo(null));
    }
  }, [showProfile, currentUser]);

  // Lấy thông báo khi mở dropdown
  useEffect(() => {
    if (showNotiDropdown && currentUser?.id) {
      fetch(`${NOTIFICATION_API}${currentUser.id}?skip=0&limit=10`)
        .then(res => res.json())
        .then(data => setNotifications(Array.isArray(data) ? data : []))
        .catch(() => setNotifications([]));
    }
  }, [showNotiDropdown, currentUser]);

  // Lấy số lượng thông báo chưa đọc mỗi khi user đăng nhập hoặc khi dropdown mở
  useEffect(() => {
    if (currentUser?.id) {
      fetch(`http://localhost:8000/notifications/user/${currentUser.id}/unread-count`)
        .then(res => res.json())
        .then(count => setUnreadCount(count))
        .catch(() => setUnreadCount(0));
    }
  }, [currentUser, showNotiDropdown, notifications]);

  // Khi đánh dấu đã đọc, cập nhật lại số lượng chưa đọc
  const handleReadNotification = async (noti) => {
    if (!noti.is_read) {
      await fetch(`http://localhost:8000/notifications/read/${noti.notification_id}`, { method: "PUT" });
      setNotifications(nots => nots.map(n => n.notification_id === noti.notification_id ? { ...n, is_read: true } : n));
      // Gọi lại API để cập nhật số lượng chưa đọc
      if (currentUser?.id) {
        fetch(`http://localhost:8000/notifications/user/${currentUser.id}/unread-count`)
          .then(res => res.json())
          .then(count => setUnreadCount(count))
          .catch(() => setUnreadCount(0));
      }
    }
    // Có thể chuyển hướng hoặc hiển thị chi tiết tại đây nếu muốn
  };

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

            {/* Badge thông báo nằm bên trái AnimatePresence */}
            <div className="dropdown d-inline-block position-relative me-3">
              <button
                type="button"
                className="btn btn-warning position-relative"
                style={{ fontWeight: "bold" }}
                onClick={() => setShowNotiDropdown(open => !open)}
              >
                <FaBell className="me-1" />
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {unreadCount}
                    <span className="visually-hidden">unread messages</span>
                  </span>
                )}
              </button>
              <ul
                className={`dropdown-menu${showNotiDropdown ? " show" : ""}`}
                style={{ position: "absolute", top: "100%", right: 0, zIndex: 1000, minWidth: "320px", maxHeight: "400px", overflowY: "auto" }}
              >
                {notifications.length === 0 ? (
                  <li className="dropdown-item text-muted">Không có thông báo nào.</li>
                ) : (
                  notifications.map(noti => (
                    <li
                      key={noti.notification_id}
                      className={`dropdown-item${noti.is_read ? "" : " fw-bold text-dark"}`}
                      style={{ cursor: "pointer", background: noti.is_read ? "#fff" : "#ffeeba" }}
                      onClick={() => handleReadNotification(noti)}
                    >
                      <div>{noti.title}</div>
                      <div className="small text-secondary">{noti.message}</div>
                    </li>
                  ))
                )}
              </ul>
            </div>

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
        {tenantInfo ? (
          <div>
            <div className="mb-2"><b>Họ tên:</b> {tenantInfo.full_name}</div>
            <div className="mb-2"><b>Email:</b> {tenantInfo.email}</div>
            <div className="mb-2"><b>SĐT:</b> {tenantInfo.phone_number}</div>
            <div className="mb-2"><b>Ngày sinh:</b> {tenantInfo.date_of_birth}</div>
            <div className="mb-2"><b>Giới tính:</b> {tenantInfo.gender}</div>
            <div className="mb-2"><b>Đang thuê:</b> {tenantInfo.is_rent ? "Có" : "Không"}</div>
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
