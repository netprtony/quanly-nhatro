import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navbar,
  Nav,
  Form,
  FormControl,
  Button,
  NavDropdown,
  Container,
} from "react-bootstrap";
import { useUser } from "../contexts/UserContext"; // Nếu dùng context

export default function Header() {
  const navigate = useNavigate();
  const { currentUser, logout } = useUser(); // Nếu không dùng context, hãy dùng localStorage như bên dưới

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout(); // dùng context
    navigate("/login");
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
                  <NavDropdown
                      title={<span style={{ color: "#ffffff" }}>Tài khoản</span>}
                      id="basic-nav-dropdown"
                      align="end"
                      menuVariant="dark"
                      style={{ zIndex: 1055, position: "relative" }} // <- không hiệu quả lắm với menu, nhưng có thể dùng thử
                    >
                    <NavDropdown.Item onClick={() => handleNavigate("/login")}>
                      Đăng nhập
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={() => handleNavigate("/register")}>
                      Đăng ký
                    </NavDropdown.Item>
                  </NavDropdown>
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
                  <NavDropdown
                    title={
                      <span style={{ color: "#ffffff" }}>
                        👤 {currentUser?.username || "User"}
                      </span>
                    }
                    id="user-nav-dropdown"
                    align="end"
                  >
                    <NavDropdown.Item onClick={handleLogout}>
                      Đăng xuất
                    </NavDropdown.Item>
                  </NavDropdown>
                </motion.div>
              )}
            </AnimatePresence>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </motion.div>
  );
}
