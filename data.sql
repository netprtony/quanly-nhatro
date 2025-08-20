DROP DATABASE IF EXISTS NHATROBAOBAO;
CREATE DATABASE NHATROBAOBAO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
USE NHATROBAOBAO;
-- Bảng người thuê
CREATE TABLE Tenants (
    tenant_id VARCHAR(15) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') DEFAULT 'Other',
    date_of_birth DATE,
    phone_number VARCHAR(20),
    email VARCHAR(100),
    id_card_front_path VARCHAR(255),  -- ảnh CCCD mặt trước
    id_card_back_path VARCHAR(255),   -- ảnh CCCD mặt sau
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Bảng người dùng hệ thống
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(15),
    token VARCHAR(512),
    otp_code VARCHAR(10),
    otp_expiry DATETIME,	
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    UNIQUE (tenant_id)  -- Nếu mỗi tenant chỉ có 1 user
);

-- Bảng loại phòng
CREATE TABLE RoomTypes (
    room_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price_per_month DECIMAL(10, 2) NOT NULL
);

-- Bảng phòng
CREATE TABLE Rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL UNIQUE,
    room_type_id INT NOT NULL,
    max_occupants INT DEFAULT 1,
    is_available BOOLEAN DEFAULT TRUE,
    floor_number INT,
    description TEXT,
    FOREIGN KEY (room_type_id) REFERENCES RoomTypes(room_type_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);



-- Bảng hợp đồng
CREATE TABLE Contracts (
    contract_id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(15) NOT NULL,
    room_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    deposit_amount DECIMAL(10, 2),
    monthly_rent DECIMAL(10, 2),
    contract_status ENUM('Active', 'Terminated', 'Pending') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);

-- Bảng công tơ điện
CREATE TABLE ElectricityMeters (
    meter_id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    month DATE NOT NULL,
    old_reading INT NOT NULL,
    new_reading INT NOT NULL,
    electricity_rate DECIMAL(10,2) DEFAULT 3500,
    usage_kwh INT GENERATED ALWAYS AS (new_reading - old_reading) STORED,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS ((new_reading - old_reading) * electricity_rate) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, month),
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);

-- Bảng hóa đơn
CREATE TABLE Invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    month DATE NOT NULL,
    total_amount DECIMAL(12,2),
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, month),
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);

-- Bảng chi tiết hóa đơn
CREATE TABLE InvoiceDetails (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    meter_id INT,
    fee_type ENUM('Rent', 'Electricity', 'Trash', 'Water', 'Wifi', 'Other') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    note TEXT,
    FOREIGN KEY (invoice_id) REFERENCES Invoices(invoice_id) ON DELETE CASCADE,
    FOREIGN KEY (meter_id) REFERENCES ElectricityMeters(meter_id) ON DELETE SET NULL
);
CREATE TABLE Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    paid_amount DECIMAL(12,2) NOT NULL,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('Cash', 'BankTransfer', 'Momo', 'ZaloPay', 'Other') DEFAULT 'Cash',
    transaction_reference VARCHAR(100),  -- mã giao dịch nếu thanh toán điện tử
    note TEXT,
    FOREIGN KEY (invoice_id) REFERENCES Invoices(invoice_id) ON DELETE CASCADE
);
CREATE TABLE RepairRequests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(15) NOT NULL,
    room_id INT NOT NULL,
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    issue_description TEXT NOT NULL,
    status ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);
CREATE TABLE Reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    contact_phone VARCHAR(15) NOT NULL, 
    room_id INT NOT NULL,
    user_id INT NULL,
    status ENUM('Pending', 'Confirmed', 'Cancelled' ) DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE,
    INDEX idx_reservation_id (reservation_id)
);
CREATE TABLE Notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
CREATE TABLE Devices (
    device_id INT AUTO_INCREMENT PRIMARY KEY,
    device_name VARCHAR(100) NOT NULL,
    room_id INT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_device_room FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE SET NULL
);
INSERT INTO RoomTypes (type_name, description, price_per_month) VALUES
('Standard', 'Phòng cơ bản, không điều hòa', 3000000.00),
('Deluxe', 'Phòng có điều hòa, ban công', 5000000.00),
('Premium', 'Phòng rộng, đầy đủ tiện nghi', 7000000.00),
('Studio', 'Phòng studio, bếp riêng', 6000000.00),
('Single', 'Phòng đơn, nhỏ gọn', 2500000.00),
('Double', 'Phòng đôi, 2 giường', 4500000.00),
('Family', 'Phòng gia đình, 3-4 người', 8000000.00),
('VIP', 'Phòng cao cấp, view đẹp', 10000000.00),
('Economy', 'Phòng tiết kiệm, tiện nghi cơ bản', 2000000.00),
('Luxury', 'Phòng sang trọng, đầy đủ tiện nghi', 12000000.00);
-- Thêm phòng
INSERT INTO Rooms (room_number, room_type_id, max_occupants, floor_number)
VALUES 
('Phòng 1A', 1, 4, 0),
('Phòng 2A', 1, 4, 0),
('Phòng 3A', 1, 4, 0),
('Phòng 4A', 1, 4, 0),
('Phòng 5A', 1, 4, 0),
('Phòng 6A', 1, 4, 0),
('Phòng 7A', 1, 4, 0),
('Phòng 8A', 1, 4, 0),

('Phòng 1B', 1, 4, 0),
('Phòng 2B', 1, 4, 0),
('Phòng 3B', 1, 4, 0),
('Phòng 4B', 1, 4, 0),
('Phòng 5B', 1, 4, 0),
('Phòng 6B', 1, 4, 0),
('Phòng 7B', 1, 4, 0),
('Phòng 8B', 1, 4, 0),
('Phòng 9B', 1, 4, 0);
INSERT INTO Devices (device_name, room_id, description, is_active)
VALUES
-- Phòng 1A
('Quạt trần', 1, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 1, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 1, 'Ổ cắm 3 chấu', TRUE),

-- Phòng 2A
('Quạt trần', 2, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 2, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 2, 'Ổ cắm 3 chấu', TRUE),

-- Phòng 3A
('Quạt trần', 3, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 3, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 3, 'Ổ cắm 3 chấu', TRUE),

-- Phòng 4A
('Quạt trần', 4, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 4, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 4, 'Ổ cắm 3 chấu', TRUE),

-- Phòng 5A
('Quạt trần', 5, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 5, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 5, 'Ổ cắm 3 chấu', TRUE),

-- Phòng 6A
('Quạt trần', 6, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 6, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 6, 'Ổ cắm 3 chấu', TRUE),

-- Phòng 7A
('Quạt trần', 7, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 7, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 7, 'Ổ cắm 3 chấu', TRUE),

-- Phòng 8A
('Quạt trần', 8, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 8, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 8, 'Ổ cắm 3 chấu', TRUE),

-- Phòng 1B
('Quạt trần', 9, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 9, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 9, 'Ổ cắm 3 chấu', TRUE),

-- Phòng 2B
('Quạt trần', 10, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 10, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 10, 'Ổ cắm 3 chấu', TRUE),

-- Phòng 3B
('Quạt trần', 11, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 11, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 11, 'Ổ cắm 3 chấu', TRUE),

-- Phòng 4B
('Quạt trần', 12, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 12, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 12, 'Ổ cắm 3 chấu', TRUE),

-- Phòng 5B
('Quạt trần', 13, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 13, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 13, 'Ổ cắm 3 chấu', TRUE),

-- Phòng 6B
('Quạt trần', 14, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 14, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 14, 'Ổ cắm 3 chấu', TRUE),

-- Phòng 7B
('Quạt trần', 15, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 15, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 15, 'Ổ cắm 3 chấu', TRUE),

-- Phòng 8B
('Quạt trần', 16, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 16, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 16, 'Ổ cắm 3 chấu', TRUE),

-- Phòng 9B
('Quạt trần', 17, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 17, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 17, 'Ổ cắm 3 chấu', TRUE);

-- Thêm khách thuê
INSERT INTO Tenants (tenant_id, full_name, gender, date_of_birth, phone_number, email, id_card_front_path, id_card_back_path, address)
VALUES 
('079203029606', 'Huỳnh Vĩ Khang', 'Male', '2003-05-28', '0767487840', 'huynhvikhang913@gmail.com', '/public/cccd/front_079203029607.jpg', '/public/cccd/back_079203029607.jpg', '5/5A Nguyễn Thị Sóc, Bà Điểm, Hóc Môn, TP.HCM');
INSERT INTO Tenants (tenant_id, full_name, gender, date_of_birth, phone_number, email, id_card_front_path, id_card_back_path, address) VALUES
('079203029607', 'Nguyen Van An', 'Male', '1990-05-15', '0905123456', 'an.nguyen@example.com', '/idcards/T001_front.jpg', '/idcards/T001_back.jpg', '123 Le Loi, Q1, HCMC'),
('079203029608', 'Tran Thi Bich', 'Female', '1995-08-22', '0912345678', 'bich.tran@example.com', '/idcards/T002_front.jpg', '/idcards/T002_back.jpg', '456 Nguyen Hue, Q1, HCMC'),
('079203029609', 'Le Van Cuong', 'Male', '1988-03-10', '0923456789', 'cuong.le@example.com', '/idcards/T003_front.jpg', '/idcards/T003_back.jpg', '789 Tran Hung Dao, Q5, HCMC'),
('079203029610', 'Pham Thi Dung', 'Female', '1993-11-30', '0934567890', 'dung.pham@example.com', '/idcards/T004_front.jpg', '/idcards/T004_back.jpg', '101 Vo Van Tan, Q3, HCMC'),
('079203029611', 'Hoang Van Em', 'Male', '1992-07-25', '0945678901', 'em.hoang@example.com', '/idcards/T005_front.jpg', '/idcards/T005_back.jpg', '202 Ly Tu Trong, Q1, HCMC'),
('079203029612', 'Vo Thi Phuong', 'Female', '1996-02-14', '0956789012', 'phuong.vo@example.com', '/idcards/T006_front.jpg', '/idcards/T006_back.jpg', '303 Hai Ba Trung, Q3, HCMC'),
('079203029613', 'Nguyen Van Hung', 'Male', '1985-09-05', '0967890123', 'hung.nguyen@example.com', '/idcards/T007_front.jpg', '/idcards/T007_back.jpg', '404 Nguyen Trai, Q5, HCMC'),
('079203029614', 'Tran Van Khanh', 'Male', '1991-12-20', '0978901234', 'khanh.tran@example.com', '/idcards/T008_front.jpg', '/idcards/T008_back.jpg', '505 Le Van Sy, Q3, HCMC'),
('079203029615', 'Le Thi Lan', 'Female', '1994-04-18', '0989012345', 'lan.le@example.com', '/idcards/T009_front.jpg', '/idcards/T009_back.jpg', '606 Cach Mang Thang 8, Q3, HCMC'),
('079203029616', 'Pham Van Minh', 'Male', '1989-06-12', '0990123456', 'minh.pham@example.com', '/idcards/T010_front.jpg', '/idcards/T010_back.jpg', '707 Nguyen Dinh Chieu, Q3, HCMC');
INSERT INTO Users (username, email, password, tenant_id, role, is_active) VALUES
('an.nguyen', 'an.nguyen@example.com', '$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e', '079203029607', 'USER', TRUE),
('bich.tran', 'bich.tran@example.com', '$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e', '079203029608', 'USER', TRUE),
('cuong.le', 'cuong.le@example.com', '$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e', '079203029609', 'USER', TRUE),
('dung.pham', 'dung.pham@example.com', '$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e', '079203029610', 'USER', TRUE),
('em.hoang', 'em.hoang@example.com', '$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e', '079203029611', 'USER', TRUE),
('phuong.vo', 'phuong.vo@example.com', '$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e', '079203029612', 'USER', TRUE),
('hung.nguyen', 'hung.nguyen@example.com', '$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e', '079203029613', 'USER', TRUE),
('duc.hieu', 'nguyenduchieu@example.com', '$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e', '079203029614', 'USER', TRUE),
('gia.hieu', 'giahieu@example.com', '$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e', '079203029615', 'USER', TRUE),
('dinh.khoa', 'minh.pham@example.com', '$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e', '079203029616', 'USER', TRUE),
('admin1', 'admin1@example.com', '$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e', NULL, 'ADMIN', TRUE);

-- Thêm hợp đồng
INSERT INTO Contracts (tenant_id, room_id, start_date, end_date, deposit_amount, monthly_rent, contract_status) VALUES
('079203029607', 1, '2025-01-01', '2026-01-01', 3000000.00, 3000000.00, 'Active'),
('079203029608', 2, '2025-02-01', '2026-02-01', 5000000.00, 5000000.00, 'Active'),
('079203029609', 3, '2025-03-01', '2026-03-01', 7000000.00, 7000000.00, 'Active'),
('079203029610', 4, '2025-04-01', '2026-04-01', 6000000.00, 6000000.00, 'Active'),
('079203029611', 5, '2025-05-01', '2026-05-01', 2500000.00, 2500000.00, 'Active'),
('079203029612', 6, '2025-06-01', '2026-06-01', 4500000.00, 4500000.00, 'Active'),
('079203029613', 7, '2025-07-01', '2026-07-01', 8000000.00, 8000000.00, 'Active'),
('079203029614', 8, '2025-08-01', '2026-08-01', 10000000.00, 10000000.00, 'Active'),
('079203029615', 9, '2025-09-01', '2026-09-01', 2000000.00, 2000000.00, 'Active'),
('079203029616', 10, '2025-10-01', '2026-10-01', 12000000.00, 12000000.00, 'Active');
-- Thêm đặt chỗ trước


-- Thêm công tơ điện
INSERT INTO ElectricityMeters (room_id, month, old_reading, new_reading, electricity_rate) VALUES
(1, '2025-07-01', 1000, 1200, 3500.00),
(2, '2025-07-01', 1500, 1800, 3500.00),
(3, '2025-07-01', 2000, 2300, 3500.00),
(4, '2025-07-01', 2500, 2700, 3500.00),
(5, '2025-07-01', 3000, 3100, 3500.00),
(6, '2025-07-01', 3500, 3800, 3500.00),
(7, '2025-07-01', 4000, 4300, 3500.00),
(8, '2025-07-01', 4500, 4800, 3500.00),
(9, '2025-07-01', 5000, 5100, 3500.00),
(10, '2025-07-01', 5500, 5800, 3500.00);

-- Thêm hóa đơn
INSERT INTO Invoices (room_id, month, total_amount, is_paid) VALUES
(1, '2025-01-01', 3500000.00, FALSE),
(2, '2025-01-01', 5500000.00, TRUE),
(3, '2025-01-01', 7500000.00, FALSE),
(4, '2025-01-01', 6500000.00, TRUE),
(5, '2025-01-01', 3000000.00, FALSE),
(6, '2025-01-01', 5000000.00, TRUE),
(7, '2025-01-01', 8500000.00, FALSE),
(8, '2025-01-01', 10500000.00, TRUE),
(9, '2025-01-01', 2500000.00, FALSE),
(10, '2025-01-01', 12500000.00, TRUE);

-- Thêm chi tiết hóa đơn
INSERT INTO InvoiceDetails (invoice_id, meter_id, fee_type, amount, note) VALUES
(1, 1, 'Rent', 3000000.00, 'Tiền thuê tháng 1'),
(1, 1, 'Electricity', 700000.00, 'Tiền điện tháng 1'),
(2, 2, 'Rent', 5000000.00, 'Tiền thuê tháng 1'),
(2, 2, 'Electricity', 1050000.00, 'Tiền điện tháng 1'),
(3, 3, 'Rent', 7000000.00, 'Tiền thuê tháng 1'),
(3, 3, 'Electricity', 1050000.00, 'Tiền điện tháng 1'),
(4, 4, 'Rent', 6000000.00, 'Tiền thuê tháng 1'),
(4, 4, 'Electricity', 700000.00, 'Tiền điện tháng 1'),
(5, 5, 'Rent', 2500000.00, 'Tiền thuê tháng 1'),
(5, 5, 'Electricity', 350000.00, 'Tiền điện tháng 1'),
(6, 6, 'Rent', 4500000.00, 'Tiền thuê tháng 1'),
(6, 6, 'Electricity', 1050000.00, 'Tiền điện tháng 1'),
(7, 7, 'Rent', 8000000.00, 'Tiền thuê tháng 1'),
(7, 7, 'Electricity', 1050000.00, 'Tiền điện tháng 1'),
(8, 8, 'Rent', 10000000.00, 'Tiền thuê tháng 1'),
(8, 8, 'Electricity', 1050000.00, 'Tiền điện tháng 1'),
(9, 9, 'Rent', 2000000.00, 'Tiền thuê tháng 1'),
(9, 9, 'Electricity', 350000.00, 'Tiền điện tháng 1'),
(10, 10, 'Rent', 12000000.00, 'Tiền thuê tháng 1'),
(10, 10, 'Electricity', 1050000.00, 'Tiền điện tháng 1');

-- Thêm thanh toán
INSERT INTO Payments (invoice_id, paid_amount, payment_date, payment_method, transaction_reference, note) VALUES
(2, 5500000.00, '2025-01-05 10:00:00', 'Momo', 'MM123456', 'Thanh toán hóa đơn tháng 1'),
(4, 6500000.00, '2025-01-06 11:00:00', 'BankTransfer', 'BT123456', 'Thanh toán hóa đơn tháng 1'),
(6, 5000000.00, '2025-01-07 12:00:00', 'Cash', NULL, 'Thanh toán hóa đơn tháng 1'),
(8, 10500000.00, '2025-01-08 13:00:00', 'ZaloPay', 'ZP123456', 'Thanh toán hóa đơn tháng 1'),
(10, 12500000.00, '2025-01-09 14:00:00', 'Momo', 'MM789012', 'Thanh toán hóa đơn tháng 1'),
(2, 5500000.00, '2025-02-05 10:00:00', 'Momo', 'MM123457', 'Thanh toán hóa đơn tháng 2'),
(4, 6500000.00, '2025-02-06 11:00:00', 'BankTransfer', 'BT123457', 'Thanh toán hóa đơn tháng 2'),
(6, 5000000.00, '2025-02-07 12:00:00', 'Cash', NULL, 'Thanh toán hóa đơn tháng 2'),
(8, 10500000.00, '2025-02-08 13:00:00', 'ZaloPay', 'ZP123457', 'Thanh toán hóa đơn tháng 2'),
(10, 12500000.00, '2025-02-09 14:00:00', 'Momo', 'MM789013', 'Thanh toán hóa đơn tháng 2');


-- Thêm thông báo
INSERT INTO Notifications (user_id, title, message, is_read) VALUES
(1, 'Hóa đơn tháng 1', 'Hóa đơn tháng 1 đã được tạo, vui lòng thanh toán trước ngày 10', FALSE),
(2, 'Hóa đơn tháng 1', 'Hóa đơn tháng 1 đã được thanh toán', TRUE),
(3, 'Hóa đơn tháng 1', 'Hóa đơn tháng 1 đã được tạo, vui lòng thanh toán trước ngày 10', FALSE),
(4, 'Hóa đơn tháng 1', 'Hóa đơn tháng 1 đã được thanh toán', TRUE),
(5, 'Hóa đơn tháng 1', 'Hóa đơn tháng 1 đã được tạo, vui lòng thanh toán trước ngày 10', FALSE),
(6, 'Hóa đơn tháng 1', 'Hóa đơn tháng 1 đã được thanh toán', TRUE),
(7, 'Hóa đơn tháng 1', 'Hóa đơn tháng 1 đã được tạo, vui lòng thanh toán trước ngày 10', FALSE),
(8, 'Hóa đơn tháng 1', 'Hóa đơn tháng 1 đã được thanh toán', TRUE),
(9, 'Hóa đơn tháng 1', 'Hóa đơn tháng 1 đã được tạo, vui lòng thanh toán trước ngày 10', FALSE),
(10, 'Hóa đơn tháng 1', 'Hóa đơn tháng 1 đã được thanh toán', TRUE);

