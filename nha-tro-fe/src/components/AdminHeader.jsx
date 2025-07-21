import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaAngleDown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useUser } from "../contexts/UserContext"; // đường dẫn tùy cấu trúc của bạn
const AdminHeader = () => {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    window.location.href = "/login"; // hoặc dùng useNavigate
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
            {/* ... các nav-link */}
          </ul>

          {currentUser && (
            <motion.div
              className="dropdown d-flex align-items-center"
              whileHover={{ scale: 1.03 }}
            >
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
                data-bs-toggle="dropdown"
              >
                <FaAngleDown />
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><Link className="dropdown-item" to="#">Thông tin cá nhân</Link></li>
                <li><Link className="dropdown-item" to="#">Đổi mật khẩu</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item text-danger" onClick={handleLogout}>Đăng xuất</button></li>
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminHeader;
