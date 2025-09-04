USE NHATROBAOBAO;
-- SHOW PROCEDURE STATUS WHERE Db = 'NHATROBAOBAO'
-- 1. Báo cáo Tỷ lệ phòng trống vs phòng đang được thuê
DELIMITER //
CREATE PROCEDURE sp_room_availability_report()
BEGIN
    SELECT 
        SUM(CASE WHEN is_available = 1 THEN 1 ELSE 0 END) AS empty_rooms,
        SUM(CASE WHEN is_available = 0 THEN 1 ELSE 0 END) AS rented_rooms,
        COUNT(*) AS total_rooms,
        ROUND(SUM(CASE WHEN is_available = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS empty_percentage,
        ROUND(SUM(CASE WHEN is_available = 0 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS rented_percentage
    FROM Rooms;
END //
DELIMITER ;
-- 2. Báo cáo Doanh thu trung bình theo loại phòng
DELIMITER //
CREATE PROCEDURE sp_avg_revenue_by_roomtype()
BEGIN
    SELECT 
        rt.roomtype_id,
        rt.type_name,
        AVG(i.total_amount) AS avg_revenue
    FROM RoomTypes rt
    JOIN Rooms r ON rt.roomtype_id = r.roomtype_id
    JOIN Contracts c ON r.room_id = c.room_id
    JOIN Invoices i ON c.contract_id = i.contract_id
    GROUP BY rt.roomtype_id, rt.type_name
    ORDER BY avg_revenue DESC;
END //
DELIMITER ;
-- 3. Báo cáo Tình trạng phòng theo tầng
DELIMITER //
CREATE PROCEDURE sp_room_status_by_floor()
BEGIN
    SELECT 
        r.floor,
        COUNT(*) AS total_rooms,
        SUM(CASE WHEN r.is_available = 1 THEN 1 ELSE 0 END) AS empty_rooms,
        SUM(CASE WHEN r.is_available = 0 THEN 1 ELSE 0 END) AS rented_rooms
    FROM Rooms r
    GROUP BY r.floor
    ORDER BY r.floor;
END //
DELIMITER ;
-- 4.Báo cáo Top loại phòng được thuê nhiều nhất
DELIMITER //
CREATE PROCEDURE sp_top_rented_roomtypes()
BEGIN
    SELECT 
        rt.roomtype_id,
        rt.type_name,
        COUNT(c.contract_id) AS total_rented
    FROM RoomTypes rt
    JOIN Rooms r ON rt.roomtype_id = r.roomtype_id
    JOIN Contracts c ON r.room_id = c.room_id
    GROUP BY rt.roomtype_id, rt.type_name
    ORDER BY total_rented DESC
    LIMIT 5;
END //
DELIMITER ;
-- 5. Danh sách Phòng cần bảo trì thiết bị (is_active = false)
DELIMITER //
CREATE PROCEDURE sp_rooms_need_maintenance()
BEGIN
    SELECT 
        r.room_id,
        r.room_name,
        d.device_id,
        d.device_name,
        d.is_active
    FROM Devices d
    JOIN Rooms r ON d.room_id = r.room_id
    WHERE d.is_active = 0;
END //
DELIMITER ;
-- 1. Thống kê số lượng khách thuê theo trạng thái (Active, Pending, Terminated)
DELIMITER //
CREATE PROCEDURE sp_TenantCountByStatus()
BEGIN
    SELECT status, COUNT(*) AS total_tenants
    FROM Tenants
    GROUP BY status;
END;
DELIMITER ;
-- 2. Thống kê giới tính, độ tuổi khách thuê
DELIMITER //
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
END;
DELIMITER ;
-- 3. Danh sách khách thuê mới trong tháng / quý / năm
DELIMITER //
CREATE PROCEDURE sp_NewTenantsByPeriod(IN p_type VARCHAR(10))
BEGIN
    IF p_type = 'MONTH' THEN
        SELECT * FROM Tenants
        WHERE MONTH(created_at) = MONTH(CURDATE())
          AND YEAR(created_at) = YEAR(CURDATE());
    ELSEIF p_type = 'QUARTER' THEN
        SELECT * FROM Tenants
        WHERE QUARTER(created_at) = QUARTER(CURDATE())
          AND YEAR(created_at) = YEAR(CURDATE());
    ELSEIF p_type = 'YEAR' THEN
        SELECT * FROM Tenants
        WHERE YEAR(created_at) = YEAR(CURDATE());
    END IF;
END;
DELIMITER ;
-- 4. Khách thuê sắp hết hạn hợp đồng (trong 30 ngày tới)
DELIMITER //
CREATE PROCEDURE sp_TenantsExpiringContracts()
BEGIN
    SELECT t.tenant_id, t.full_name, c.contract_id, c.end_date
    FROM Contracts c
    JOIN Tenants t ON c.tenant_id = t.tenant_id
    WHERE c.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      AND c.status = 'ACTIVE';
END;
DELIMITER ;
-- 5. Khách thuê nợ tiền (Invoices chưa thanh toán hoặc thanh toán thiếu)
DELIMITER //
CREATE PROCEDURE sp_TenantsWithDebt()
BEGIN
    SELECT 
        t.tenant_id, 
        t.full_name,
        i.invoice_id,
        i.total_amount,
        COALESCE(SUM(p.amount_paid), 0) AS total_paid,
        (i.total_amount - COALESCE(SUM(p.amount_paid), 0)) AS remaining_amount
    FROM Invoices i
    JOIN Contracts c ON i.contract_id = c.contract_id
    JOIN Tenants t ON c.tenant_id = t.tenant_id
    LEFT JOIN Payments p ON i.invoice_id = p.invoice_id
    GROUP BY i.invoice_id
    HAVING remaining_amount > 0;
END;
DELIMITER ;
