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
    id_card_front_path VARCHAR(255),  -- ảnh CCCD mặt trước
    id_card_back_path VARCHAR(255),   -- ảnh CCCD mặt sau
    is_rent BOOLEAN DEFAULT TRUE,
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
    is_available BOOLEAN DEFAULT FALSE,
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
    num_people INT DEFAULT 1,         -- số lượng người ở
    num_vehicles INT DEFAULT 0,       -- số lượng xe
    contract_status ENUM('Active', 'Terminated', 'Pending') DEFAULT 'Active',
    path_contract VARCHAR(255),
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
-- Bảng công tơ nước
CREATE TABLE WaterMeters (
    meter_id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    month DATE NOT NULL,
    old_reading INT NOT NULL, -- chỉ số cũ (m3)
    new_reading INT NOT NULL, -- chỉ số mới (m3)
    water_rate DECIMAL(10,2) DEFAULT 15000, -- giá 1m3 nước (vd: 15,000đ)
    usage_m3 INT GENERATED ALWAYS AS (new_reading - old_reading) STORED, -- số m3 tiêu thụ
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS ((new_reading - old_reading) * water_rate) STORED,
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
    electricity_meter_id INT,
    water_meter_id  INT,
    fee_type ENUM('Rent', 'Electricity', 'Trash', 'Water', 'Wifi', 'Other') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    note TEXT,
    FOREIGN KEY (invoice_id) REFERENCES Invoices(invoice_id) ON DELETE CASCADE,
    FOREIGN KEY (electricity_meter_id) REFERENCES ElectricityMeters(meter_id) ON DELETE SET NULL,
	FOREIGN KEY (water_meter_id) REFERENCES WaterMeters(meter_id) ON DELETE SET NULL
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

CREATE TABLE Reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    contact_phone VARCHAR(15) NOT NULL, 
    room_id INT NOT NULL,
    user_id INT NULL,
    status ENUM('Pending', 'Confirmed', 'Cancelled', 'Signed' ) DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE,
    INDEX idx_reservation_id (reservation_id)
);
CREATE TABLE Notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL, -- phải là NULL
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
CREATE TABLE RoomImages (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);
-- Khi thêm chi tiết hóa đơn
DELIMITER //
CREATE TRIGGER trg_after_insert_invoice_detail
AFTER INSERT ON InvoiceDetails
FOR EACH ROW
BEGIN
    UPDATE Invoices
    SET total_amount = (
        SELECT IFNULL(SUM(amount), 0)
        FROM InvoiceDetails
        WHERE invoice_id = NEW.invoice_id
    )
    WHERE invoice_id = NEW.invoice_id;
END;
//
DELIMITER ;

-- Khi cập nhật chi tiết hóa đơn
DELIMITER //
CREATE TRIGGER trg_after_update_invoice_detail
AFTER UPDATE ON InvoiceDetails
FOR EACH ROW
BEGIN
    UPDATE Invoices
    SET total_amount = (
        SELECT IFNULL(SUM(amount), 0)
        FROM InvoiceDetails
        WHERE invoice_id = NEW.invoice_id
    )
    WHERE invoice_id = NEW.invoice_id;
END;
//
DELIMITER ;

-- Khi xóa chi tiết hóa đơn
DELIMITER //
CREATE TRIGGER trg_after_delete_invoice_detail
AFTER DELETE ON InvoiceDetails
FOR EACH ROW
BEGIN
    UPDATE Invoices
    SET total_amount = (
        SELECT IFNULL(SUM(amount), 0)
        FROM InvoiceDetails
        WHERE invoice_id = OLD.invoice_id
    )
    WHERE invoice_id = OLD.invoice_id;
END;
//
DELIMITER ;
DELIMITER //

DELIMITER ;
DELIMITER $$

CREATE TRIGGER PreventDeleteRoom
BEFORE DELETE ON Rooms
FOR EACH ROW
BEGIN
    DECLARE cnt INT;
    SELECT COUNT(*) INTO cnt
    FROM Contracts
    WHERE room_id = OLD.room_id
      AND contract_status = 'Active'
      AND (end_date IS NULL OR end_date >= CURDATE());

    IF cnt > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Không thể xóa phòng: phòng đang có hợp đồng thuê hoạt động';
    END IF;
END$$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER PreventUpdateRoom
BEFORE UPDATE ON Rooms
FOR EACH ROW
BEGIN
    DECLARE cnt INT;

    -- Nếu có hợp đồng hoạt động thì chỉ cho phép sửa room_type_id và max_occupants
    SELECT COUNT(*) INTO cnt
    FROM Contracts
    WHERE room_id = OLD.room_id
      AND contract_status = 'Active'
      AND (end_date IS NULL OR end_date >= CURDATE());

    IF cnt > 0 THEN
        -- Nếu sửa các trường khác ngoài room_type_id và max_occupants thì chặn
        IF (NEW.room_number <> OLD.room_number
            OR NEW.is_available <> OLD.is_available
            OR NEW.floor_number <> OLD.floor_number
            OR NEW.description <> OLD.description) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Chỉ được phép sửa room_type_id và max_occupants khi phòng đang có hợp đồng hoạt động';
        END IF;
    END IF;
END$$

DELIMITER ;
DELIMITER $$

-- Khi thêm thanh toán, cập nhật hóa đơn thành đã thanh toán
CREATE TRIGGER trg_after_insert_payment
AFTER INSERT ON Payments
FOR EACH ROW
BEGIN
    UPDATE Invoices
    SET is_paid = TRUE
    WHERE invoice_id = NEW.invoice_id;
END$$

-- Khi xóa thanh toán, cập nhật hóa đơn thành chưa thanh toán
CREATE TRIGGER trg_after_delete_payment
AFTER DELETE ON Payments
FOR EACH ROW
BEGIN
    UPDATE Invoices
    SET is_paid = FALSE
    WHERE invoice_id = OLD.invoice_id;
END$$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER trg_after_insert_invoice_notify
AFTER INSERT ON Invoices
FOR EACH ROW
BEGIN
    DECLARE v_tenant_id VARCHAR(15);
    DECLARE v_user_id INT;
    DECLARE v_room_number VARCHAR(50);

    -- Lấy tenant_id từ hợp đồng của phòng
    SELECT tenant_id INTO v_tenant_id
    FROM Contracts
    WHERE room_id = NEW.room_id
      AND contract_status = 'Active'
      AND (end_date IS NULL OR end_date >= CURDATE())
    LIMIT 1;

    -- Lấy user_id từ bảng Users
    SELECT id INTO v_user_id
    FROM Users
    WHERE tenant_id = v_tenant_id
    LIMIT 1;

    -- Lấy số phòng
    SELECT room_number INTO v_room_number
    FROM Rooms
    WHERE room_id = NEW.room_id
    LIMIT 1;

    -- Nếu tìm được user_id thì thêm thông báo
    IF v_user_id IS NOT NULL THEN
        INSERT INTO Notifications (user_id, title, message, is_read)
        VALUES (
            v_user_id,
            CONCAT('Hóa đơn mới phòng ', v_room_number),
            CONCAT('Hóa đơn tháng ', DATE_FORMAT(NEW.month, '%Y-%m'), ' đã được tạo. Vui lòng kiểm tra và thanh toán trước hạn!'),
            FALSE
        );
    END IF;
END$$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER trg_after_insert_reservation_notify
AFTER INSERT ON Reservations
FOR EACH ROW
BEGIN
    DECLARE v_tenant_name VARCHAR(100);
    DECLARE v_room_number VARCHAR(50);

    -- Lấy số phòng
    SELECT room_number INTO v_room_number
    FROM Rooms
    WHERE room_id = NEW.room_id
    LIMIT 1;

    -- Nếu có user_id thì lấy tên từ Users, nếu không thì lấy số điện thoại
    IF NEW.user_id IS NOT NULL THEN
        SELECT username INTO v_tenant_name
        FROM Users
        WHERE id = NEW.user_id
        LIMIT 1;
    ELSE
        SET v_tenant_name = NEW.contact_phone;
    END IF;

    -- Thêm thông báo cho admin (user_id = NULL)
    INSERT INTO Notifications (user_id, title, message, is_read)
    VALUES (
        NULL,
        CONCAT('Đặt phòng mới: ', v_room_number),
        CONCAT('Khách thuê ', v_tenant_name, ' vừa đặt phòng ', v_room_number, '. Vui lòng kiểm tra và xác nhận!'),
        FALSE
    );
END$$

DELIMITER ;
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
INSERT INTO Rooms (room_number, room_type_id, max_occupants, floor_number, is_available)
VALUES 
('Phòng 1A', 1, 4, 0, 0),
('Phòng 2A', 2, 4, 0, 0),
('Phòng 3A', 3, 2, 0, 0),
('Phòng 4A', 4, 4, 0, 0),
('Phòng 5A', 5, 3, 0, 0),
('Phòng 6A', 6, 4, 0, 0),
('Phòng 7A', 7, 1, 0, 0),
('Phòng 8A', 8, 4, 0, 0),

('Phòng 1B', 9, 4, 0, 0),
('Phòng 2B', 10, 4, 0, 0),
('Phòng 3B', 1, 4, 0, 1),
('Phòng 4B', 1, 4, 0, 1),
('Phòng 5B', 1, 4, 0, 1),
('Phòng 6B', 1, 4, 0, 1),
('Phòng 7B', 1, 4, 0, 1),
('Phòng 8B', 1, 4, 0, 1),
('Phòng 9B', 1, 4, 0, 1);
INSERT INTO `roomimages` VALUES (7,1,'/roomImage/1c801685-26f7-4949-b6b1-ce324e673d44_1755743014.jpg'),(8,2,'/roomImage/nha-tro-homestay 1.png'),(9,3,'/roomImage/z6940363114799-140893ff0d098a87f063ed43ca5eb211_1756109071.jpg'),(10,4,'/roomImage/images (7).jpg'),(11,5,'/roomImage/images (13).jpg'),(12,6,'/roomImage/uecuhb.jpg'),(13,7,'/roomImage/images4.jpg'),(14,8,'/roomImage/img-9698_1756086720.jpg'),(15,9,'/roomImage/gen-h-1_1756183493 (1).jpg'),(16,10,'/roomImage/img-6931_1756092450.jpg'),(17,11,'/roomImage/images6.jpg'),(18,12,'/roomImage/img-3621_1756184053.jpg'),(19,13,'/roomImage/images2.jpg'),(20,14,'/roomImage/images (7).jpg'),(21,15,'/roomImage/images.jpg'),(22,16,'/roomImage/img-3621_1756184053 (1).jpg'),(23,17,'/roomImage/2daf357b-a8ec-4cab-9e04-f2b268631c6e_1756181830.jpg');
-- Thêm thiết bị cho các phòng
INSERT INTO Devices (device_name, room_id, description, is_active)
VALUES
-- Phòng 1A
('Quạt trần', 1, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 1, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 1, 'Ổ cắm 3 chấu', TRUE),

-- Phòng 2A
('Điều hòa ', 2, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 2, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 2, 'Ổ cắm 3 chấu', TRUE),

-- Phòng 3A
('Quạt trần', 3, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 3, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 3, 'Ổ cắm 3 chấu', TRUE),
('TIvi Oled ', 3, 'Tivi đời mới ', TRUE),

-- Phòng 4A
('Quạt trần', 4, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 4, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 4, 'Ổ cắm 3 chấu', TRUE),
('Bếp điện từ ', 4, 'Bếp Toshiba đa chức năng ',TRUE),

-- Phòng 5A
('Quạt trần', 5, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 5, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 5, 'Ổ cắm 3 chấu', TRUE),
('Giường ', 5, 'Giường gỗ mun ', TRUE),

-- Phòng 6A
('Quạt trần', 6, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 6, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 6, 'Ổ cắm 3 chấu', TRUE),
('Giường ', 6, 'Giường gỗ mun ', TRUE),

-- Phòng 7A
('Quạt trần', 7, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 7, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 7, 'Ổ cắm 3 chấu', TRUE),
('Giường ', 7, 'Giường gỗ mun ', TRUE),
('Bếp điện từ ', 7, 'Bếp Toshiba đa chức năng ',TRUE),

-- Phòng 8A
('Quạt trần', 8, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 8, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 8, 'Ổ cắm 3 chấu', TRUE),


-- Phòng 1B
('Quạt trần', 9, 'Quạt trần 3 cánh', TRUE),
('Đèn LED', 9, 'Đèn chiếu sáng 20W', TRUE),
('Ổ cắm điện', 9, 'Ổ cắm 3 chấu', TRUE),
('Tủ lạnh', 9, 'Tủ lạnh Toshiba  3 ngăn  ',TRUE),
('Bếp điện từ ', 9, 'Bếp Toshiba đa chức năng ',TRUE),

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
LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES ('079203029607','Nguyen Van An','Male','1990-05-15','0905123456','/cccd/079203029607_front_download (1).jpg','/cccd/079203029607_back_download (2).jpg',1,'123 Le Loi, Q1, HCMC','2025-08-27 22:53:51'),('079203029608','Tran Thi Bich','Female','1995-08-22','0912345678','/cccd/079203029608_front_download.jpg','/cccd/079203029608_back_download (2).jpg',1,'456 Nguyen Hue, Q1, HCMC','2025-08-27 22:53:51'),('079203029609','Le Van Cuong','Male','1988-03-10','0923456789','/cccd/079203029609_front_download.jpg','/cccd/079203029609_back_download (2).jpg',1,'789 Tran Hung Dao, Q5, HCMC','2025-08-27 22:53:51'),('079203029610','Pham Thi Dung','Female','1993-11-30','0934567890','/cccd/079203029610_front_download (1).jpg','/cccd/079203029610_back_download (2).jpg',1,'101 Vo Van Tan, Q3, HCMC','2025-08-27 22:53:51'),('079203029611','Hoang Van Em','Male','1992-07-25','0945678901','/cccd/079203029611_front_download.jpg','/cccd/079203029611_back_download (2).jpg',1,'202 Ly Tu Trong, Q1, HCMC','2025-08-27 22:53:51'),('079203029612','Vo Thi Phuong','Female','1996-02-14','0956789012','/cccd/079203029612_front_download (1).jpg','/cccd/079203029612_back_download (2).jpg',1,'303 Hai Ba Trung, Q3, HCMC','2025-08-27 22:53:51'),('079203029613','Nguyen Van Hung','Male','1985-09-05','0967890123','/cccd/079203029613_front_download.jpg','/cccd/079203029613_back_download (2).jpg',1,'404 Nguyen Trai, Q5, HCMC','2025-08-27 22:53:51'),('079203029614','Tran Van Khanh','Male','1991-12-20','0978901234','/cccd/079203029614_front_download.jpg','/cccd/079203029614_back_download (2).jpg',1,'505 Le Van Sy, Q3, HCMC','2025-08-27 22:53:51'),('079203029615','Le Thi Lan','Female','1994-04-18','0989012345','/cccd/079203029615_front_download.jpg','/cccd/079203029615_back_download (2).jpg',1,'606 Cach Mang Thang 8, Q3, HCMC','2025-08-27 22:53:51'),('079203029616','Pham Van Minh','Male','1989-06-12','0990123456','/cccd/079203029616_front_download.jpg','/cccd/079203029616_back_download (2).jpg',1,'707 Nguyen Dinh Chieu, Q3, HCMC','2025-08-27 22:53:51');
UNLOCK TABLES;
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
('079203029607', 1, '2025-01-01', '2026-01-01', 300000.00, 3000000.00, 'Active'),
('079203029608', 2, '2025-02-01', '2026-02-01', 500000.00, 5000000.00, 'Active'),
('079203029609', 3, '2025-03-01', '2026-03-01', 700000.00, 7000000.00, 'Active'),
('079203029610', 4, '2025-04-01', '2026-04-01', 600000.00, 6000000.00, 'Active'),
('079203029611', 5, '2025-05-01', '2026-05-01', 250000.00, 2500000.00, 'Active'),
('079203029612', 6, '2025-06-01', '2026-06-01', 450000.00, 4500000.00, 'Active'),
('079203029613', 7, '2025-07-01', '2026-07-01', 800000.00, 8000000.00, 'Active'),
('079203029614', 8, '2025-08-01', '2026-08-01', 1000000.00, 10000000.00, 'Active'),
('079203029615', 9, '2025-09-01', '2026-09-01', 200000.00, 2000000.00, 'Active'),
('079203029616', 10, '2025-10-01', '2026-10-01', 1200000.00, 12000000.00, 'Active');
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
INSERT WaterMeters (room_id, month, old_reading, new_reading, water_rate) VALUES
(1, '2025-07-01', 0, 20, 15000.00),
(2, '2025-07-01', 15, 21, 15000.00),
(3, '2025-07-01', 17, 23, 15000.00),
(4, '2025-07-01', 28, 40, 15000.00),
(5, '2025-07-01', 88, 99, 15000.00),
(6, '2025-07-01', 33, 44, 15000.00),
(7, '2025-07-01', 23, 43, 15000.00),
(8, '2025-07-01', 23, 35, 15000.00),
(9, '2025-07-01', 35, 37, 15000.00),
(10, '2025-07-01', 11, 23, 15000.00);







