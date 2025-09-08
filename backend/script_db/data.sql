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
    tenant_status ENUM('Active', 'Terminated', 'Pending') DEFAULT 'Pending',
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Bảng người dùng hệ thống
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(15) NULL,
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
    full_name VARCHAR(100) NULL DEFAULT 'Khách lạ',
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

        SELECT COUNT(*) INTO cnt
        FROM Contracts
        WHERE room_id = OLD.room_id
        AND contract_status = 'Active'
        AND (end_date IS NULL OR end_date >= CURDATE());

        IF cnt > 0 THEN
            -- Chỉ chặn sửa room_number, floor_number, description
            IF (NEW.room_number <> OLD.room_number
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

DELIMITER $$

CREATE TRIGGER trg_update_status_on_contract_update
AFTER UPDATE ON Contracts
FOR EACH ROW
BEGIN
    IF NEW.contract_status = "Terminated" THEN
        -- Cập nhật trạng thái khách thuê
        UPDATE Tenants
        SET tenant_status = "Terminated"
        WHERE tenant_id = NEW.tenant_id;

        -- Cập nhật trạng thái phòng
        UPDATE Rooms
        SET is_available = TRUE
        WHERE room_id = NEW.room_id;
    END IF;
END$$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER trg_update_status_on_contract_delete
AFTER DELETE ON Contracts
FOR EACH ROW
BEGIN
    -- Cập nhật trạng thái khách thuê
    UPDATE Tenants
    SET tenant_status = "Terminated"
    WHERE tenant_id = OLD.tenant_id;

    -- Cập nhật trạng thái phòng
    UPDATE Rooms
    SET is_available = TRUE
    WHERE room_id = OLD.room_id;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_after_update_reservation_status
AFTER UPDATE ON Reservations
FOR EACH ROW
BEGIN
    IF NEW.status = 'Confirmed' THEN
        INSERT INTO Notifications (user_id, title, message, is_read)
        VALUES (
            NEW.user_id,
            'Đặt phòng đã được xác nhận',
            CONCAT('Đặt phòng của bạn đã được xác nhận. Vui lòng đến nhận phòng đúng thời gian quy định.'),
            FALSE
        );
    ELSEIF NEW.status = 'Cancelled' THEN
        INSERT INTO Notifications (user_id, title, message, is_read)
        VALUES (
            NEW.user_id,
            'Đặt phòng đã bị hủy',
            CONCAT('Đặt phòng của bạn đã bị hủy. Vui lòng liên hệ quản lý nếu cần hỗ trợ.'),
            FALSE
        );
    END IF;
END$$

DELIMITER ;
DELIMITER $$

-- Khi thêm hợp đồng: cập nhật trạng thái khách thuê và phòng
CREATE TRIGGER trg_after_insert_contract
AFTER INSERT ON Contracts
FOR EACH ROW
BEGIN
    -- Đổi trạng thái khách thuê thành Active
    UPDATE Tenants
    SET tenant_status = 'Active'
    WHERE tenant_id = NEW.tenant_id;

    -- Đổi trạng thái phòng thành không còn trống
    UPDATE Rooms
    SET is_available = FALSE
    WHERE room_id = NEW.room_id;
END$$

-- Khi sửa hợp đồng: nếu hợp đồng đang Active thì cập nhật trạng thái khách thuê và phòng
CREATE TRIGGER trg_after_update_contract
AFTER UPDATE ON Contracts
FOR EACH ROW
BEGIN
    IF NEW.contract_status = 'Active' THEN
        UPDATE Tenants
        SET tenant_status = 'Active'
        WHERE tenant_id = NEW.tenant_id;

        UPDATE Rooms
        SET is_available = FALSE
        WHERE room_id = NEW.room_id;
    END IF;
    -- Nếu hợp đồng bị Terminated thì trạng thái sẽ được xử lý ở trigger khác (đã có)
END$$

-- Khi xóa hợp đồng: cập nhật trạng thái khách thuê và phòng ngược lại
CREATE TRIGGER trg_after_delete_contract
AFTER DELETE ON Contracts
FOR EACH ROW
BEGIN
    -- Đổi trạng thái khách thuê thành Terminated
    UPDATE Tenants
    SET tenant_status = 'Terminated'
    WHERE tenant_id = OLD.tenant_id;

    -- Đổi trạng thái phòng thành trống
    UPDATE Rooms
    SET is_available = TRUE
    WHERE room_id = OLD.room_id;
END$$

DELIMITER ;


SET GLOBAL event_scheduler = ON;
DELIMITER $$

CREATE EVENT notify_contract_expiry
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO
BEGIN
    INSERT INTO Notifications (user_id, title, message, is_read, created_at)
    SELECT u.id,
           'Hợp đồng sắp hết hạn',
           CONCAT('Hợp đồng phòng ', r.room_number, ' sẽ hết hạn vào ngày ', DATE_FORMAT(c.end_date, '%d-%m-%Y'), '. Vui lòng liên hệ gia hạn.'),
           FALSE,
           NOW()
    FROM Contracts c
    JOIN Tenants t ON c.tenant_id = t.tenant_id
    JOIN Users u ON t.tenant_id = u.tenant_id
    JOIN Rooms r ON c.room_id = r.room_id
    WHERE c.contract_status = 'Active'
      AND c.end_date IS NOT NULL
      AND c.end_date = DATE_ADD(CURDATE(), INTERVAL 1 MONTH);
END$$

DELIMITER ;
-- =====================================================
-- DATABASE: NhaTroBaoBao
-- File: stored_procedures.sql
-- Nội dung: Tổng hợp Stored Procedures cho báo cáo/thống kê
-- =====================================================

USE nhatrobaobao;
DELIMITER //

-- =====================================================
-- ROOMS / ROOMTYPES
-- =====================================================

-- 1. Tỷ lệ phòng trống vs phòng đang thuê
CREATE PROCEDURE sp_RoomAvailabilityStats()
BEGIN
    SELECT 
        is_available,
        COUNT(*) AS total_rooms
    FROM Rooms
    GROUP BY is_available;
END //

-- 2. Doanh thu trung bình theo loại phòng
CREATE PROCEDURE sp_AvgRevenueByRoomType()
BEGIN
    SELECT rt.type_name AS room_type,
           AVG(i.total_amount) AS avg_revenue
    FROM Invoices i
    JOIN Rooms r ON i.room_id = r.room_id
    JOIN RoomTypes rt ON r.room_type_id = rt.room_type_id
    GROUP BY rt.type_name;
END //

-- 3. Tình trạng phòng theo tầng
CREATE PROCEDURE sp_RoomStatusByFloor()
BEGIN
    SELECT 
        r.floor_number,
        SUM(CASE WHEN r.is_available = 1 THEN 1 ELSE 0 END) AS available_rooms,
        SUM(CASE WHEN r.is_available = 0 THEN 1 ELSE 0 END) AS occupied_rooms
    FROM Rooms r
    GROUP BY r.floor_number;
END //

-- 4. Top loại phòng được thuê nhiều nhất
CREATE PROCEDURE sp_TopRoomTypes()
BEGIN
    SELECT 
        rt.type_name,
        COUNT(c.contract_id) AS total_contracts
    FROM RoomTypes rt
    JOIN Rooms r ON r.room_type_id = rt.room_type_id
    JOIN Contracts c ON c.room_id = r.room_id
    GROUP BY rt.type_name
    ORDER BY total_contracts DESC
    LIMIT 5;
END //

-- 5. Danh sách phòng cần bảo trì thiết bị
CREATE PROCEDURE sp_RoomsNeedMaintenance()
BEGIN
    SELECT 
        r.room_id,
        r.room_number,
        d.device_name
    FROM Devices d
    JOIN Rooms r ON r.room_id = d.room_id
    WHERE d.is_active = 0;
END //

-- =====================================================
-- TENANTS / USERS
-- =====================================================

-- 1. Thống kê số lượng khách thuê theo trạng thái
CREATE PROCEDURE sp_TenantCountByStatus()
BEGIN
    SELECT tenant_status, COUNT(*) AS total
    FROM Tenants
    GROUP BY tenant_status;
END //

-- 2. Thống kê giới tính, độ tuổi
CREATE PROCEDURE sp_TenantGenderAgeStats()
BEGIN
    SELECT 
        gender,
        COUNT(*) AS total,
        AVG(TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE())) AS avg_age,
        MIN(TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE())) AS min_age,
        MAX(TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE())) AS max_age
    FROM Tenants
    GROUP BY gender;
END //

-- 3. Danh sách khách thuê mới theo kỳ
CREATE PROCEDURE sp_NewTenantsByPeriod(IN p_type VARCHAR(10))
BEGIN
    IF p_type = 'MONTH' THEN
        SELECT * FROM Tenants
        WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE());
    ELSEIF p_type = 'QUARTER' THEN
        SELECT * FROM Tenants
        WHERE QUARTER(created_at) = QUARTER(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE());
    ELSEIF p_type = 'YEAR' THEN
        SELECT * FROM Tenants
        WHERE YEAR(created_at) = YEAR(CURDATE());
    END IF;
END //

-- 4. Khách thuê sắp hết hạn hợp đồng
CREATE PROCEDURE sp_TenantsExpiringContracts()
BEGIN
    SELECT 
        t.tenant_id,
        t.full_name,
        c.contract_id,
        c.end_date
    FROM Tenants t
    JOIN Contracts c ON c.tenant_id = t.tenant_id
    WHERE c.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY);
END //

-- 5. Khách thuê nợ tiền
CREATE PROCEDURE sp_TenantsWithDebt()
BEGIN
    SELECT 
        t.tenant_id,
        t.full_name,
        r.room_number,
        i.invoice_id,
        i.total_amount,
        i.is_paid
    FROM Tenants t
    JOIN Contracts c ON c.tenant_id = t.tenant_id
    JOIN Rooms r ON r.room_id = c.room_id
    JOIN Invoices i ON i.room_id = r.room_id
    WHERE c.contract_status = 'Active'
      AND (c.end_date IS NULL OR c.end_date >= CURDATE())
      AND i.is_paid = 0;
END //

-- =====================================================
-- ELECTRICITY / WATER METERS
-- =====================================================

-- Chỉ số điện theo tháng và năm
CREATE PROCEDURE sp_ElectricityUsageByMonthYear(IN p_month INT, IN p_year INT)
BEGIN
    SELECT 
        r.room_number,
        em.month,
        em.old_reading,
        em.new_reading,
        em.usage_kwh,
        em.total_amount
    FROM ElectricityMeters em
    JOIN Rooms r ON r.room_id = em.room_id
    WHERE MONTH(em.month) = p_month AND YEAR(em.month) = p_year;
END //

-- Chỉ số nước theo tháng và năm
CREATE PROCEDURE sp_WaterUsageByMonthYear(IN p_month INT, IN p_year INT)
BEGIN
    SELECT 
        r.room_number,
        wm.month,
        wm.old_reading,
        wm.new_reading,
        wm.usage_m3,
        wm.total_amount
    FROM WaterMeters wm
    JOIN Rooms r ON r.room_id = wm.room_id
    WHERE MONTH(wm.month) = p_month AND YEAR(wm.month) = p_year;
END //
-- 1. Chi phí điện/nước trung bình theo phòng
CREATE PROCEDURE sp_AvgUtilityCostByRoom()
BEGIN
    SELECT 
        r.room_number,
        IFNULL(AVG(em.total_amount), 0) AS avg_electricity_cost,
        IFNULL(AVG(wm.total_amount), 0) AS avg_water_cost
    FROM Rooms r
    LEFT JOIN ElectricityMeters em ON r.room_id = em.room_id
    LEFT JOIN WaterMeters wm ON r.room_id = wm.room_id
    GROUP BY r.room_id, r.room_number;
END //

-- 2. So sánh điện/nước tháng này so với tháng trước
CREATE PROCEDURE sp_CompareUtilityMonth(IN p_month INT, IN p_year INT)
BEGIN
    SELECT 
        r.room_number,
        em_this.month AS current_month,
        em_this.usage_kwh AS electricity_this_month,
        em_prev.usage_kwh AS electricity_last_month,
        (em_this.usage_kwh - IFNULL(em_prev.usage_kwh,0)) AS electricity_diff,
        wm_this.usage_m3 AS water_this_month,
        wm_prev.usage_m3 AS water_last_month,
        (wm_this.usage_m3 - IFNULL(wm_prev.usage_m3,0)) AS water_diff
    FROM Rooms r
    LEFT JOIN ElectricityMeters em_this 
        ON r.room_id = em_this.room_id 
        AND MONTH(em_this.month) = p_month AND YEAR(em_this.month) = p_year
    LEFT JOIN ElectricityMeters em_prev 
        ON r.room_id = em_prev.room_id 
        AND MONTH(em_prev.month) = IF(p_month=1,12,p_month-1) 
        AND YEAR(em_prev.month) = IF(p_month=1,p_year-1,p_year)
    LEFT JOIN WaterMeters wm_this 
        ON r.room_id = wm_this.room_id 
        AND MONTH(wm_this.month) = p_month AND YEAR(wm_this.month) = p_year
    LEFT JOIN WaterMeters wm_prev 
        ON r.room_id = wm_prev.room_id 
        AND MONTH(wm_prev.month) = IF(p_month=1,12,p_month-1) 
        AND YEAR(wm_prev.month) = IF(p_month=1,p_year-1,p_year);
END //

-- 3. Phòng có mức tiêu thụ điện/nước cao bất thường (outlier detection)
CREATE PROCEDURE sp_UtilityOutlierRooms(IN p_month INT, IN p_year INT)
BEGIN
    -- Điện: Tính trung bình và độ lệch chuẩn
    SELECT 
        r.room_number,
        em.usage_kwh,
        stats.avg_kwh,
        stats.stddev_kwh,
        CASE 
            WHEN em.usage_kwh > stats.avg_kwh + 2 * stats.stddev_kwh THEN 'Outlier'
            ELSE 'Normal'
        END AS electricity_outlier,
        wm.usage_m3,
        stats.avg_m3,
        stats.stddev_m3,
        CASE 
            WHEN wm.usage_m3 > stats.avg_m3 + 2 * stats.stddev_m3 THEN 'Outlier'
            ELSE 'Normal'
        END AS water_outlier
    FROM Rooms r
    LEFT JOIN ElectricityMeters em 
        ON r.room_id = em.room_id 
        AND MONTH(em.month) = p_month AND YEAR(em.month) = p_year
    LEFT JOIN WaterMeters wm 
        ON r.room_id = wm.room_id 
        AND MONTH(wm.month) = p_month AND YEAR(wm.month) = p_year
    CROSS JOIN (
        SELECT 
            AVG(em2.usage_kwh) AS avg_kwh,
            STDDEV(em2.usage_kwh) AS stddev_kwh,
            AVG(wm2.usage_m3) AS avg_m3,
            STDDEV(wm2.usage_m3) AS stddev_m3
        FROM ElectricityMeters em2
        LEFT JOIN WaterMeters wm2 
            ON em2.room_id = wm2.room_id 
            AND MONTH(wm2.month) = p_month AND YEAR(wm2.month) = p_year
        WHERE MONTH(em2.month) = p_month AND YEAR(em2.month) = p_year
    ) stats
    WHERE 
        (em.usage_kwh IS NOT NULL OR wm.usage_m3 IS NOT NULL);
END //
-- =====================================================
-- INVOICES / PAYMENTS
-- =====================================================

-- 1. Tổng doanh thu theo tháng/quý/năm
CREATE PROCEDURE sp_TotalRevenueByPeriod(IN p_type VARCHAR(10), IN p_month INT, IN p_quarter INT, IN p_year INT)
BEGIN
    IF p_type = 'MONTH' THEN
        SELECT 
            p_month AS month,
            p_year AS year,
            SUM(total_amount) AS total_revenue
        FROM Invoices
        WHERE MONTH(created_at) = p_month AND YEAR(created_at) = p_year;
    ELSEIF p_type = 'QUARTER' THEN
        SELECT 
            p_quarter AS quarter,
            p_year AS year,
            SUM(total_amount) AS total_revenue
        FROM Invoices
        WHERE QUARTER(created_at) = p_quarter AND YEAR(created_at) = p_year;
    ELSEIF p_type = 'YEAR' THEN
        SELECT 
            p_year AS year,
            SUM(total_amount) AS total_revenue
        FROM Invoices
        WHERE YEAR(created_at) = p_year;
    END IF;
END //

-- 2. Tỷ lệ hóa đơn đã thanh toán vs chưa thanh toán
CREATE PROCEDURE sp_InvoicePaidRatio()
BEGIN
    SELECT 
        is_paid,
        COUNT(*) AS total
    FROM Invoices
    GROUP BY is_paid;
END //

-- 3. Thống kê doanh thu theo nguồn thu (fee_type)
CREATE PROCEDURE sp_RevenueByFeeType(IN p_month INT, IN p_year INT)
BEGIN
    SELECT 
        d.fee_type,
        SUM(d.amount) AS total_revenue
    FROM InvoiceDetails d
    JOIN Invoices i ON d.invoice_id = i.invoice_id
    WHERE MONTH(i.created_at) = p_month AND YEAR(i.created_at) = p_year
    GROUP BY d.fee_type;
END //

-- 4. Danh sách hóa đơn quá hạn thanh toán
CREATE PROCEDURE sp_OverdueInvoices()
BEGIN
    SELECT 
        i.invoice_id,
        r.room_number,
        i.month,
        i.total_amount,
        i.is_paid,
        i.created_at
    FROM Invoices i
    JOIN Rooms r ON i.room_id = r.room_id
    WHERE i.is_paid = 0
      AND i.month < CURDATE();
END //

-- 5. Tổng số tiền đã thanh toán theo phương thức
CREATE PROCEDURE sp_TotalPaidByMethod(IN p_month INT, IN p_year INT)
BEGIN
    SELECT 
        payment_method,
        SUM(paid_amount) AS total_paid
    FROM Payments
    WHERE MONTH(payment_date) = p_month AND YEAR(payment_date) = p_year
    GROUP BY payment_method;
END //

-- =====================================================
-- RESERVATIONS
-- =====================================================

-- Danh sách đặt phòng đang chờ xử lý
CREATE PROCEDURE sp_PendingReservations()
BEGIN
    SELECT * FROM Reservations WHERE status = 'PENDING';
END //

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
-- Số lượng thông báo đã gửi trong tháng/quý/năm
CREATE PROCEDURE sp_NotificationCountByPeriod(IN p_type VARCHAR(10), IN p_month INT, IN p_quarter INT, IN p_year INT)
BEGIN
    IF p_type = 'MONTH' THEN
        SELECT 
            p_month AS month,
            p_year AS year,
            COUNT(*) AS total_notifications
        FROM Notifications
        WHERE MONTH(created_at) = p_month AND YEAR(created_at) = p_year;
    ELSEIF p_type = 'QUARTER' THEN
        SELECT 
            p_quarter AS quarter,
            p_year AS year,
            COUNT(*) AS total_notifications
        FROM Notifications
        WHERE QUARTER(created_at) = p_quarter AND YEAR(created_at) = p_year;
    ELSEIF p_type = 'YEAR' THEN
        SELECT 
            p_year AS year,
            COUNT(*) AS total_notifications
        FROM Notifications
        WHERE YEAR(created_at) = p_year;
    END IF;
END //
-- Tỷ lệ người dùng đã đọc thông báo (is_read)
CREATE PROCEDURE sp_NotificationReadRatio()
BEGIN
    SELECT 
        is_read,
        COUNT(*) AS total
    FROM Notifications
    GROUP BY is_read;
END //
-- =====================================================
-- DEVICES
-- =====================================================

-- Thống kê số thiết bị hỏng
CREATE PROCEDURE sp_BrokenDevices()
BEGIN
    SELECT 
        r.room_number,
        COUNT(*) AS broken_count
    FROM Devices d
    JOIN Rooms r ON r.room_id = d.room_id
    WHERE d.is_active = 0
    GROUP BY r.room_number;
END //
-- Danh sách thiết bị phòng & trạng thái hoạt động
CREATE PROCEDURE sp_DeviceListWithStatus()
BEGIN
    SELECT 
        d.device_id,
        d.device_name,
        r.room_number,
        d.is_active,
        d.description,
        d.created_at
    FROM Devices d
    LEFT JOIN Rooms r ON d.room_id = r.room_id
    ORDER BY r.room_number, d.device_name;
END //


-- =====================================================
-- CONTRACTS
-- =====================================================

-- Thống kê tổng số hợp đồng đã ký mới theo tháng/quý/năm
CREATE PROCEDURE sp_NewContractsByPeriod(IN p_type VARCHAR(10), IN p_month INT, IN p_quarter INT, IN p_year INT)
BEGIN
    IF p_type = 'MONTH' THEN
        SELECT 
            p_month AS month,
            p_year AS year,
            COUNT(*) AS total_new_contracts
        FROM Contracts
        WHERE MONTH(created_at) = p_month AND YEAR(created_at) = p_year;
    ELSEIF p_type = 'QUARTER' THEN
        SELECT 
            p_quarter AS quarter,
            p_year AS year,
            COUNT(*) AS total_new_contracts
        FROM Contracts
        WHERE QUARTER(created_at) = p_quarter AND YEAR(created_at) = p_year;
    ELSEIF p_type = 'YEAR' THEN
        SELECT 
            p_year AS year,
            COUNT(*) AS total_new_contracts
        FROM Contracts
        WHERE YEAR(created_at) = p_year;
    END IF;
END //
-- Thống kê tỷ lệ hợp đồng theo trạng thái
CREATE PROCEDURE sp_ContractStatusRatio()
BEGIN
    SELECT 
        contract_status,
        COUNT(*) AS total
    FROM Contracts
    GROUP BY contract_status;
END //
-- Thống kê thời hạn trung bình hợp đồng (số ngày giữa start_date và end_date)
CREATE PROCEDURE sp_AvgContractDuration()
BEGIN
    SELECT 
        AVG(DATEDIFF(end_date, start_date)) AS avg_duration_days
    FROM Contracts
    WHERE end_date IS NOT NULL;
END //

-- Danh sách hợp đồng đã hết hạn
CREATE PROCEDURE sp_ExpiredContracts()
BEGIN
    SELECT 
        c.contract_id,
        t.full_name,
        r.room_number,
        c.start_date,
        c.end_date,
        c.contract_status
    FROM Contracts c
    JOIN Tenants t ON c.tenant_id = t.tenant_id
    JOIN Rooms r ON c.room_id = r.room_id
    WHERE c.end_date < CURDATE();
END //

-- Danh sách hợp đồng sắp hết hạn (trong 30 ngày tới)
CREATE PROCEDURE sp_ExpiringSoonContracts()
BEGIN
    SELECT 
        c.contract_id,
        t.full_name,
        r.room_number,
        c.start_date,
        c.end_date,
        c.contract_status
    FROM Contracts c
    JOIN Tenants t ON c.tenant_id = t.tenant_id
    JOIN Rooms r ON c.room_id = r.room_id
    WHERE c.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY);
END //

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
('Phòng 1A', 1, 3, 0, 0),
('Phòng 2A', 2, 2, 0, 0),
('Phòng 3A', 3, 4, 0, 0),
('Phòng 4A', 4, 1, 0, 0),
('Phòng 5A', 5, 2, 0, 0),
('Phòng 6A', 6, 2, 0, 0),
('Phòng 7A', 7, 1, 0, 0),
('Phòng 8A', 8, 4, 0, 0),

('Phòng 1B', 9, 3, 1, 0),
('Phòng 2B', 10, 2, 1, 0),
('Phòng 3B', 1, 2, 1, 1),
('Phòng 4B', 2, 3, 1, 1),
('Phòng 5B', 4, 2, 1, 1),
('Phòng 6B', 5, 1, 1, 1),
('Phòng 7B', 7, 4, 1, 1),
('Phòng 8B', 6, 2, 1, 1),
('Phòng 9B', 3, 1, 1, 1);
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
INSERT INTO Contracts (tenant_id, room_id, start_date, end_date, deposit_amount, monthly_rent, contract_status, num_people, num_vehicles) VALUES
('079203029607', 1, '2025-01-01', '2026-01-01', 300000.00, 3000000.00, 'Active', 1, 2),
('079203029608', 2, '2025-02-01', '2026-02-01', 500000.00, 5000000.00, 'Active', 2, 2),
('079203029609', 3, '2025-03-01', '2026-03-01', 700000.00, 7000000.00, 'Active', 3, 4),
('079203029610', 4, '2025-04-01', '2026-04-01', 600000.00, 6000000.00, 'Active', 1, 1),
('079203029611', 5, '2025-05-01', '2026-05-01', 250000.00, 2500000.00, 'Active', 3, 1),
('079203029612', 6, '2025-06-01', '2026-06-01', 450000.00, 4500000.00, 'Active', 4 , 3),
('079203029613', 7, '2025-07-01', '2026-07-01', 800000.00, 8000000.00, 'Active', 2,2),
('079203029614', 8, '2025-08-01', '2026-08-01', 1000000.00, 10000000.00, 'Active', 2, 1),
('079203029615', 9, '2025-09-01', '2026-09-01', 200000.00, 2000000.00, 'Active', 3, 2),
('079203029616', 10, '2025-10-01', '2026-10-01', 1200000.00, 12000000.00, 'Active', 4, 2);
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







