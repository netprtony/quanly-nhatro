DROP DATABASE IF EXISTS QuanLyNhaTro;
CREATE DATABASE QuanLyNhaTro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE QuanLyNhaTro;

-- Bảng khách thuê
CREATE TABLE KhachThue (
    ma_khach_thue VARCHAR(15) PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    gioi_tinh ENUM('Nam', 'Nữ', 'Khác') DEFAULT 'Khác',
    ngay_sinh DATE,
    so_dien_thoai VARCHAR(20),
    email VARCHAR(100),
    so_cccd VARCHAR(15),
    anh_cccd_truoc VARCHAR(255),
    anh_cccd_sau VARCHAR(255),
    dia_chi TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng người dùng
CREATE TABLE NguoiDung (
    ma_nguoi_dung INT AUTO_INCREMENT PRIMARY KEY,
    ten_dang_nhap VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    mat_khau VARCHAR(255) NOT NULL,
    ma_khach_thue VARCHAR(15),
    token VARCHAR(512),
    otp_code VARCHAR(10),
    het_han_otp DATETIME,	
    vai_tro ENUM('USER', 'ADMIN') DEFAULT 'USER',
    hoat_dong BOOLEAN DEFAULT TRUE,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_khach_thue) REFERENCES KhachThue(ma_khach_thue) ON DELETE CASCADE,
    UNIQUE (ma_khach_thue)
);

-- Bảng loại phòng
CREATE TABLE LoaiPhong (
    ma_loai_phong INT AUTO_INCREMENT PRIMARY KEY,
    ten_loai VARCHAR(100) NOT NULL UNIQUE,
    mo_ta TEXT,
    gia_thang DECIMAL(10, 2) NOT NULL
);

-- Bảng phòng
CREATE TABLE Phong (
    ma_phong INT AUTO_INCREMENT PRIMARY KEY,
    so_phong VARCHAR(50) NOT NULL UNIQUE,
    ma_loai_phong INT NOT NULL,
    so_nguoi_toi_da INT DEFAULT 1,
    co_san BOOLEAN DEFAULT TRUE,
    tang INT,
    mo_ta TEXT,
    FOREIGN KEY (ma_loai_phong) REFERENCES LoaiPhong(ma_loai_phong)
);

-- Bảng hợp đồng
CREATE TABLE HopDong (
    ma_hop_dong INT AUTO_INCREMENT PRIMARY KEY,
    ma_khach_thue VARCHAR(15) NOT NULL,
    ma_phong INT NOT NULL,
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE,
    tien_coc DECIMAL(10, 2),
    tien_thue_thang DECIMAL(10, 2),
    trang_thai ENUM('DangThue', 'DaHuy', 'ChoDuyet') DEFAULT 'DangThue',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_khach_thue) REFERENCES KhachThue(ma_khach_thue),
    FOREIGN KEY (ma_phong) REFERENCES Phong(ma_phong)
);

-- Bảng dịch vụ
CREATE TABLE DichVu (
    ma_dich_vu INT AUTO_INCREMENT PRIMARY KEY,
    ten_dich_vu VARCHAR(100) NOT NULL,
    don_gia DECIMAL(10,2) NOT NULL,
    don_vi_tinh VARCHAR(50),
    mo_ta TEXT
);

-- Bảng thiết bị
CREATE TABLE ThietBi (
    ma_thiet_bi INT AUTO_INCREMENT PRIMARY KEY,
    ten_thiet_bi VARCHAR(100) NOT NULL,
    so_luong INT DEFAULT 1,
    tinh_trang ENUM('Tot', 'HuHong', 'DangSua') DEFAULT 'Tot',
    mo_ta TEXT,
    ma_phong INT NOT NULL,
    FOREIGN KEY (ma_phong) REFERENCES Phong(ma_phong) ON DELETE CASCADE
);

-- Bảng công tơ điện
CREATE TABLE CongToDien (
    ma_cong_to INT AUTO_INCREMENT PRIMARY KEY,
    ma_phong INT NOT NULL,
    thang DATE NOT NULL,
    chi_so_cu INT NOT NULL,
    chi_so_moi INT NOT NULL,
    don_gia DECIMAL(10,2) DEFAULT 3500,
    so_dien INT GENERATED ALWAYS AS (chi_so_moi - chi_so_cu) STORED,
    tong_tien DECIMAL(10,2) GENERATED ALWAYS AS ((chi_so_moi - chi_so_cu) * don_gia) STORED,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ma_phong, thang),
    FOREIGN KEY (ma_phong) REFERENCES Phong(ma_phong) ON DELETE CASCADE
);

-- Bảng hóa đơn
CREATE TABLE HoaDon (
    ma_hoa_don INT AUTO_INCREMENT PRIMARY KEY,
    ma_phong INT NOT NULL,
    thang DATE NOT NULL,
    tong_tien DECIMAL(12,2),
    da_thanh_toan BOOLEAN DEFAULT FALSE,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ma_phong, thang),
    FOREIGN KEY (ma_phong) REFERENCES Phong(ma_phong) ON DELETE CASCADE
);

-- Bảng chi tiết hóa đơn
CREATE TABLE ChiTietHoaDon (
    ma_chi_tiet INT AUTO_INCREMENT PRIMARY KEY,
    ma_hoa_don INT NOT NULL,
    ma_cong_to INT,
    ma_dich_vu INT NOT NULL,  -- Thay vì ENUM
    so_tien DECIMAL(10,2) NOT NULL,
    ghi_chu TEXT,
    FOREIGN KEY (ma_hoa_don) REFERENCES HoaDon(ma_hoa_don) ON DELETE CASCADE,
    FOREIGN KEY (ma_cong_to) REFERENCES CongToDien(ma_cong_to) ON DELETE SET NULL,
    FOREIGN KEY (ma_dich_vu) REFERENCES DichVu(ma_dich_vu) ON DELETE CASCADE
);

-- Bảng thanh toán
CREATE TABLE ThanhToan (
    ma_thanh_toan INT AUTO_INCREMENT PRIMARY KEY,
    ma_hoa_don INT NOT NULL,
    so_tien_thanh_toan DECIMAL(12,2) NOT NULL,
    ngay_thanh_toan DATETIME DEFAULT CURRENT_TIMESTAMP,
    hinh_thuc ENUM('TienMat', 'ChuyenKhoan', 'Momo', 'ZaloPay', 'Khac') DEFAULT 'TienMat',
    ma_giao_dich VARCHAR(100),
    ghi_chu TEXT,
    FOREIGN KEY (ma_hoa_don) REFERENCES HoaDon(ma_hoa_don) ON DELETE CASCADE
);
-- Thêm dữ liệu mẫu cho bảng KhachThue
INSERT INTO KhachThue (ma_khach_thue, ho_ten, gioi_tinh, ngay_sinh, so_dien_thoai, email, anh_cccd_truoc, anh_cccd_sau, dia_chi) VALUES
('KT001', 'Nguyễn Văn An', 'Nam', '1995-03-15', '0905123456', 'an.nguyen@gmail.com', 'cccd_truoc_an.jpg', 'cccd_sau_an.jpg', '123 Đường Láng, Hà Nội'),
('KT002', 'Trần Thị Bình', 'Nữ', '1998-07-20', '0916234567', 'binh.tran@gmail.com', 'cccd_truoc_binh.jpg', 'cccd_sau_binh.jpg', '45 Nguyễn Huệ, TP.HCM'),
('KT003', 'Lê Minh Châu', 'Nam', '1993-11-10', '0937345678', 'chau.le@gmail.com', 'cccd_truoc_chau.jpg', 'cccd_sau_chau.jpg', '78 Trần Phú, Đà Nẵng'),
('KT004', 'Phạm Hồng Đức', 'Nam', '1996-05-25', '0948456789', 'duc.pham@gmail.com', 'cccd_truoc_duc.jpg', 'cccd_sau_duc.jpg', '12 Lê Lợi, Huế'),
('KT005', 'Hoàng Thị Mai', 'Nữ', '1999-09-30', '0921567890', 'mai.hoang@gmail.com', 'cccd_truoc_mai.jpg', 'cccd_sau_mai.jpg', '56 Phạm Văn Đồng, Hà Nội');

-- Thêm dữ liệu mẫu cho bảng NguoiDung
INSERT INTO NguoiDung (ten_dang_nhap, email, mat_khau, ma_khach_thue, vai_tro, hoat_dong) VALUES
('luudinhkhoa', 'an.nguyen@gmail.com', '$2a$12$XgjG8xy8yQC9/DBZRPl9lO65iqOb/IAav3VbPEuiGZFeJQW6bpo8y', 'KT001', 'USER', TRUE),
('huynhvikhang', 'binh.tran@gmail.com', '$2a$12$XgjG8xy8yQC9/DBZRPl9lO65iqOb/IAav3VbPEuiGZFeJQW6bpo8y', 'KT002', 'USER', TRUE),
('huynhgiabao', 'chau.le@gmail.com', '$2a$12$XgjG8xy8yQC9/DBZRPl9lO65iqOb/IAav3VbPEuiGZFeJQW6bpo8y', 'KT003', 'USER', TRUE),
('nguyenthanhtruc', 'duc.pham@gmail.com', '$2a$12$XgjG8xy8yQC9/DBZRPl9lO65iqOb/IAav3VbPEuiGZFeJQW6bpo8y', 'KT004', 'USER', TRUE),
('dominhson', 'mai.hoang@gmail.com', '$2a$12$XgjG8xy8yQC9/DBZRPl9lO65iqOb/IAav3VbPEuiGZFeJQW6bpo8y', 'KT005', 'USER', TRUE),
('admin', 'admin1@xai.com', '$2a$12$QmqPZUIHgqGmrDAdYwf7SuIg3Qx.v1jWiZ0lMJ5ZqYgJ7Ij.lLM.K', NULL, 'ADMIN', TRUE);

-- Thêm dữ liệu mẫu cho bảng LoaiPhong
INSERT INTO LoaiPhong (ten_loai, mo_ta, gia_thang) VALUES
('Phòng đơn', 'Phòng 20m2, có điều hòa, WC riêng', 3000000.00),
('Phòng đôi', 'Phòng 30m2, 2 giường, ban công', 4500000.00),
('Phòng VIP', 'Phòng 40m2, đầy đủ tiện nghi, view đẹp', 6000000.00);

-- Thêm dữ liệu mẫu cho bảng Phong
INSERT INTO Phong (so_phong, ma_loai_phong, so_nguoi_toi_da, co_san, tang, mo_ta) VALUES
('101', 1, 1, TRUE, 1, 'Phòng tầng 1, gần cầu thang'),
('102', 1, 1, FALSE, 1, 'Phòng tầng 1, có cửa sổ lớn'),
('201', 2, 2, TRUE, 2, 'Phòng tầng 2, thoáng mát'),
('202', 2, 2, FALSE, 2, 'Phòng tầng 2, gần ban công'),
('301', 3, 3, TRUE, 3, 'Phòng VIP, đầy đủ nội thất cao cấp');

-- Thêm dữ liệu mẫu cho bảng HopDong
INSERT INTO HopDong (ma_khach_thue, ma_phong, ngay_bat_dau, ngay_ket_thuc, tien_coc, tien_thue_thang, trang_thai) VALUES
('KT001', 1, '2025-01-01', '2025-12-31', 3000000.00, 3000000.00, 'DangThue'),
('KT002', 2, '2025-02-01', '2025-08-01', 4500000.00, 4500000.00, 'DangThue'),
('KT003', 3, '2025-03-01', NULL, 4500000.00, 4500000.00, 'DangThue'),
('KT004', 4, '2025-04-01', '2025-10-01', 6000000.00, 6000000.00, 'ChoDuyet'),
('KT005', 5, '2025-05-01', '2026-05-01', 6000000.00, 6000000.00, 'DangThue');

-- Thêm dữ liệu mẫu cho bảng DichVu
INSERT INTO DichVu (ten_dich_vu, don_gia, don_vi_tinh, mo_ta) VALUES
('Điện', 3500.00, 'kWh', 'Tính theo công tơ điện'),
('Nước', 20000.00, 'm3', 'Nước sạch sinh hoạt'),
('Internet', 100000.00, 'Tháng', 'Wifi tốc độ cao'),
('Vệ sinh', 50000.00, 'Tháng', 'Dịch vụ dọn dẹp chung');

-- Thêm dữ liệu mẫu cho bảng ThietBi
INSERT INTO ThietBi (ten_thiet_bi, so_luong, tinh_trang, mo_ta, ma_phong) VALUES
('Điều hòa', 1, 'Tot', 'Điều hòa 12000BTU', 1),
('Tủ lạnh', 1, 'Tot', 'Tủ lạnh 180L', 2),
('Máy giặt', 1, 'HuHong', 'Máy giặt 7kg', 3),
('Bàn ghế', 2, 'Tot', 'Bàn ghế gỗ', 4),
('Giường', 2, 'Tot', 'Giường đôi 1.6m', 5);

-- Thêm dữ liệu mẫu cho bảng CongToDien
INSERT INTO CongToDien (ma_phong, thang, chi_so_cu, chi_so_moi, don_gia) VALUES
(1, '2025-06-01', 100, 150, 3500.00),
(2, '2025-06-01', 200, 280, 3500.00),
(3, '2025-06-01', 150, 200, 3500.00),
(4, '2025-06-01', 300, 350, 3500.00),
(5, '2025-06-01', 120, 180, 3500.00);

-- Thêm dữ liệu mẫu cho bảng HoaDon
INSERT INTO HoaDon (ma_phong, thang, tong_tien, da_thanh_toan) VALUES
(1, '2025-06-01', 3250000.00, FALSE),
(2, '2025-06-01', 4800000.00, TRUE),
(3, '2025-06-01', 4650000.00, FALSE),
(4, '2025-06-01', 6150000.00, FALSE),
(5, '2025-06-01', 6200000.00, TRUE);

-- Thêm dữ liệu mẫu cho bảng ChiTietHoaDon
INSERT INTO ChiTietHoaDon (ma_hoa_don, ma_cong_to, ma_dich_vu, so_tien, ghi_chu) VALUES
(1, 1, 1, 175000.00, 'Tiền điện tháng 6'),
(1, NULL, 2, 40000.00, 'Tiền nước tháng 6'),
(1, NULL, 3, 100000.00, 'Tiền internet tháng 6'),
(2, 2, 1, 280000.00, 'Tiền điện tháng 6'),
(2, NULL, 3, 100000.00, 'Tiền internet tháng 6'),
(3, 3, 1, 175000.00, 'Tiền điện tháng 6'),
(4, 4, 1, 175000.00, 'Tiền điện tháng 6'),
(4, NULL, 4, 50000.00, 'Tiền vệ sinh tháng 6'),
(5, 5, 1, 210000.00, 'Tiền điện tháng 6'),
(5, NULL, 3, 100000.00, 'Tiền internet tháng 6');

-- Thêm dữ liệu mẫu cho bảng ThanhToan
INSERT INTO ThanhToan (ma_hoa_don, so_tien_thanh_toan, ngay_thanh_toan, hinh_thuc, ma_giao_dich, ghi_chu) VALUES
(2, 4800000.00, '2025-06-05 10:00:00', 'ChuyenKhoan', 'TX123456', 'Thanh toán hóa đơn tháng 6'),
(5, 6200000.00, '2025-06-06 15:30:00', 'Momo', 'TX789012', 'Thanh toán hóa đơn tháng 6');