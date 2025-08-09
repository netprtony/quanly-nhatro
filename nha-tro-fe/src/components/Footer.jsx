import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#004643",
        color: "#abd1c6",
        padding: "2rem 0 1rem",
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
        {/* Thông tin liên hệ chính */}
        <div
          className="d-flex flex-column flex-md-row justify-content-between align-items-start text-start"
          style={{ gap: "1.5rem", padding: "0 1rem" }}
        >
          {/* Cột 1: Thông tin chung */}
          <div>
            <h5 style={{ color: "#f9bc60", fontWeight: 700 }}>🏠 Nhà Trọ Bảo Bảo</h5>
            <p style={{ margin: 0 }}>© 2025 HUIT Nhà Trọ. All rights reserved.</p>
            <p style={{ margin: 0 }}>Địa chỉ: 5/5A Nguyễn Thị Sóc, Hóc Môn, TP.HCM</p>
            <p style={{ margin: 0 }}>📞 0123 456 789</p>
            <p style={{ margin: 0 }}>
              📧{" "}
              <a
                href="mailto:baobao.nhatro@gmail.com"
                style={{ color: "#f9bc60", textDecoration: "none" }}
              >
                baobao.nhatro@gmail.com
              </a>
            </p>
          </div>

          {/* Cột 2: Liên kết mạng xã hội với icon png */}
          <div>
            <h6 style={{ color: "#f9bc60", fontWeight: 600 }}>Liên kết</h6>
            <div className="d-flex flex-wrap align-items-center" style={{ gap: 12 }}>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
                <img src="/images/Facebook.png" alt="Facebook" width={32} height={32} style={{ borderRadius: 8 }} />
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                <img src="/images/Instagram.png" alt="Instagram" width={32} height={32} style={{ borderRadius: 8 }} />
              </a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
                <img src="/images/X.png" alt="X" width={32} height={32} style={{ borderRadius: 8 }} />
              </a>
              <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">
                <img src="/images/Youtube.png" alt="Youtube" width={32} height={32} style={{ borderRadius: 8 }} />
              </a>
              <a href="https://t.me/" target="_blank" rel="noopener noreferrer">
                <img src="/images/Telegram.png" alt="Telegram" width={32} height={32} style={{ borderRadius: 8 }} />
              </a>
              <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer">
                <img src="/images/Tiktok.png" alt="Tiktok" width={32} height={32} style={{ borderRadius: 8 }} />
              </a>
              <a href="https://www.paypal.com/" target="_blank" rel="noopener noreferrer">
                <img src="/images/Paypal.png" alt="Paypal" width={32} height={32} style={{ borderRadius: 8 }} />
              </a>
            </div>
          </div>

          {/* Cột 3: Bản đồ */}
          <div>
            <h6 style={{ color: "#f9bc60", fontWeight: 600 }}>📍 Bản đồ</h6>
            <iframe
              title="Google Map"
              src="https://www.google.com/maps?q=5/5%20%E1%BA%A4p%20B%E1%BA%AFc%20L%C3%A2n,%20B%C3%A0%20%C4%90i%E1%BB%83m,%20H%C3%B3c%20M%C3%B4n,%20H%E1%BB%93%20Ch%C3%AD%20Minh&output=embed"
              width="250"
              height="180"
              style={{ border: 0, borderRadius: "8px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </footer>
  );
}
