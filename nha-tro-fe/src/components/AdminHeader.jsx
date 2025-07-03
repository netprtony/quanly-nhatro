import React, { useEffect, useState } from 'react';
import { FaAngleDown } from 'react-icons/fa';

const AdminHeader = ({ setUser }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Lấy user từ localStorage khi component mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    if (setUser) setUser(null);
    // Có thể chuyển hướng sau khi logout nếu cần
    window.location.href = '/login';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <img
            src="/images/Store.svg"
            alt="Logo"
            width="50"
            height="50"
            className="d-inline-block align-text-top"
          />
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link active" href="#">Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Explore</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">My Accounts</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Accountants</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Stakeholders</a>
            </li>
          </ul>

          {/* Avatar, name and dropdown */}
          {currentUser && (
            <div className="dropdown d-flex align-items-center">
              <img
                src={currentUser.avatar || '/images/Manager.svg'}
                alt="Avatar"
                width="32"
                height="32"
                className="rounded-circle me-2"
                style={{ objectFit: 'cover' }}
              />
              <span className="me-2">{currentUser.username || 'Người dùng'}</span>
              <button
                className="btn btn-sm btn-light"
                type="button"
                id="userDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
              <FaAngleDown />
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><a className="dropdown-item" href="#">Thông tin cá nhân</a></li>
                <li><a className="dropdown-item" href="#">Đổi mật khẩu</a></li>
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
    </nav>
  );
};

export default AdminHeader;
