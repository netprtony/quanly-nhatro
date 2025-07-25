import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#004643",
        color: "#abd1c6",
        padding: "1.2rem 0 0.5rem 0",
        textAlign: "center",
        borderTop: "2px solid #f9bc60",
        letterSpacing: "0.5px",
        fontWeight: 500,
        fontSize: "1rem",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.04)",
        zIndex: 10,
        position: "relative",
      }}
    >
      <div className="container">
        <div
          className="d-flex flex-column flex-md-row justify-content-between align-items-center"
          style={{ gap: "0.5rem" }}
        >
          <div>
            <span style={{ color: "#f9bc60", fontWeight: 700 }}>
              🏠 Nhà Trọ Bảo Bảo
            </span>
            <span className="ms-2" style={{ color: "#abd1c6" }}>
              © 2025 IUH Nhà Trọ. All rights reserved.
            </span>
          </div>
          <div>
            <a
              href="mailto:baobao.nhatro@gmail.com"
              style={{
                color: "#f9bc60",
                textDecoration: "none",
                marginRight: 16,
              }}
            >
              📧 Liên hệ
            </a>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#f9bc60", textDecoration: "none" }}
            >
              <span style={{ fontWeight: 700 }}>Facebook</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}