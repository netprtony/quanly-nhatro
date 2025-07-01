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
CREATE TABLE Notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
CREATE TABLE AuditLogs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,  -- Ví dụ: 'CreateInvoice', 'UpdateContract'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL
);


-- Thêm loại phòng
INSERT INTO RoomTypes (type_name, description, price_per_month)
VALUES 
('Phòng thường', 'Phòng có gác và nhà vệ sinh', 1500000);


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
-- Thêm khách thuê
INSERT INTO Tenants (tenant_id, full_name, gender, date_of_birth, phone_number, email, id_card_front_path, id_card_back_path, address)
VALUES 
('079203029607', 'Huỳnh Vĩ Khang', 'Male', '2003-05-28', '0767487840', 'huynhvikhang913@gmail.com', '/public/cccd/front_079203029607.jpg', '/public/cccd/back_079203029607.jpg', '5/5A Nguyễn Thị Sóc, Bà Điểm, Hóc Môn, TP.HCM');
