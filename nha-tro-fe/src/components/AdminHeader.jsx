import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaAngleDown, FaBell } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useUser } from "../contexts/UserContext";
import Modal from "./Modal.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminHeader = () => {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const NOTIFICATION_API = "http://localhost:8000/notifications/admin/reservation";

  // Lấy token từ localStorage mỗi lần đổi mật khẩu
  const getToken = () => localStorage.getItem("token");

  React.useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.dropdown')) setDropdownOpen(false);
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  React.useEffect(() => {
    if (showNotiDropdown) {
      fetch(NOTIFICATION_API)
        .then(res => res.json())
        .then(data => setNotifications(Array.isArray(data) ? data : []))
        .catch(() => setNotifications([]));
    }
  }, [showNotiDropdown]);

  React.useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.is_read).length);
  }, [notifications]);

  React.useEffect(() => {
    // Gọi API lấy số lượng thông báo chưa đọc khi load trang
    fetch("http://localhost:8000/notifications/admin/reservation")
      .then(res => res.json())
      .then(data => {
        const count = Array.isArray(data) ? data.filter(n => !n.is_read).length : 0;
        setUnreadCount(count);
      })
      .catch(() => setUnreadCount(0));
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
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
    console.log("Token:", token);
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

  const handleReadNotification = async (noti) => {
    if (!noti.is_read) {
      await fetch(`http://localhost:8000/notifications/read/${noti.notification_id}`, { method: "PUT" });
      setNotifications(nots => nots.map(n => n.notification_id === noti.notification_id ? { ...n, is_read: true } : n));
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/dashboard">
          <img
            src="/images/Store.svg"
            alt="Logo"
            width="50"
            height="50"
            className="d-inline-block align-text-top"
          />
        </Link>

        <div className="collapse navbar-collapse justify-content-between">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/admin/dashboard">
                Bảng điều khiển
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/rooms">
                Quản lý phòng
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/type-rooms">
                Quản lý loại phòng
              </Link>
            </li>
          </ul>

          {currentUser && (
            <div className="dropdown d-flex align-items-center position-relative">
              <img
                src={currentUser.avatar || '/images/Manager.svg'}
                alt="Avatar"
                width="32"
                height="32"
                className="rounded-circle me-2"
              />
              <span className="me-2">{currentUser.username}</span>
              <button
                className="btn btn-sm btn-light"
                type="button"
                id="userDropdown"
                onClick={() => {
                  setShowProfile(false);
                  setShowChangePassword(false);
                  setDropdownOpen((open) => !open);
                }}
              >
                <FaAngleDown />
              </button>
              {/* Dropdown menu */}
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
          )}
        </div>
      </div>

      {/* Nút chuông thông báo cho admin */}
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
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            zIndex: 1000,
            minWidth: "320px",
            maxHeight: "400px",
            overflowY: "auto"
          }}
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
      <ToastContainer position="top-right" autoClose={3000} />
    </nav>
  );
};

export default AdminHeader;
