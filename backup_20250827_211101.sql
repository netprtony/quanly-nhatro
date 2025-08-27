-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: nhatrobaobao
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `contracts`
--

DROP TABLE IF EXISTS `contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contracts` (
  `contract_id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `deposit_amount` decimal(10,2) DEFAULT NULL,
  `monthly_rent` decimal(10,2) DEFAULT NULL,
  `num_people` int DEFAULT '1',
  `num_vehicles` int DEFAULT '0',
  `contract_status` enum('Active','Terminated','Pending') COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`contract_id`),
  KEY `tenant_id` (`tenant_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `contracts_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE,
  CONSTRAINT `contracts_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts`
--

LOCK TABLES `contracts` WRITE;
/*!40000 ALTER TABLE `contracts` DISABLE KEYS */;
INSERT INTO `contracts` VALUES (1,'079203029607',1,'2025-01-01','2026-01-01',3000000.00,3000000.00,1,0,'Active','2025-08-27 14:07:04'),(2,'079203029608',2,'2025-02-01','2026-02-01',5000000.00,5000000.00,1,0,'Active','2025-08-27 14:07:04'),(3,'079203029609',3,'2025-03-01','2026-03-01',7000000.00,7000000.00,1,0,'Active','2025-08-27 14:07:04'),(4,'079203029610',4,'2025-04-01','2026-04-01',6000000.00,6000000.00,1,0,'Active','2025-08-27 14:07:04'),(5,'079203029611',5,'2025-05-01','2026-05-01',2500000.00,2500000.00,1,0,'Active','2025-08-27 14:07:04'),(6,'079203029612',6,'2025-06-01','2026-06-01',4500000.00,4500000.00,1,0,'Active','2025-08-27 14:07:04'),(7,'079203029613',7,'2025-07-01','2026-07-01',8000000.00,8000000.00,1,0,'Active','2025-08-27 14:07:04'),(8,'079203029614',8,'2025-08-01','2026-08-01',10000000.00,10000000.00,1,0,'Active','2025-08-27 14:07:04'),(9,'079203029615',9,'2025-09-01','2026-09-01',2000000.00,2000000.00,1,0,'Active','2025-08-27 14:07:04'),(10,'079203029616',10,'2025-10-01','2026-10-01',12000000.00,12000000.00,1,0,'Active','2025-08-27 14:07:04');
/*!40000 ALTER TABLE `contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `device_id` int NOT NULL AUTO_INCREMENT,
  `device_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_id` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`device_id`),
  KEY `fk_device_room` (`room_id`),
  CONSTRAINT `fk_device_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
INSERT INTO `devices` VALUES (1,'Quạt trần',1,'Quạt trần 3 cánh',1,'2025-08-27 21:07:04'),(2,'Đèn LED',1,'Đèn chiếu sáng 20W',1,'2025-08-27 21:07:04'),(3,'Ổ cắm điện',1,'Ổ cắm 3 chấu',1,'2025-08-27 21:07:04'),(4,'Quạt trần',2,'Quạt trần 3 cánh',1,'2025-08-27 21:07:04'),(5,'Đèn LED',2,'Đèn chiếu sáng 20W',1,'2025-08-27 21:07:04'),(6,'Ổ cắm điện',2,'Ổ cắm 3 chấu',1,'2025-08-27 21:07:04'),(7,'Quạt trần',3,'Quạt trần 3 cánh',1,'2025-08-27 21:07:04'),(8,'Đèn LED',3,'Đèn chiếu sáng 20W',1,'2025-08-27 21:07:04'),(9,'Ổ cắm điện',3,'Ổ cắm 3 chấu',1,'2025-08-27 21:07:04'),(10,'Quạt trần',4,'Quạt trần 3 cánh',1,'2025-08-27 21:07:04'),(11,'Đèn LED',4,'Đèn chiếu sáng 20W',1,'2025-08-27 21:07:04'),(12,'Ổ cắm điện',4,'Ổ cắm 3 chấu',1,'2025-08-27 21:07:04'),(13,'Quạt trần',5,'Quạt trần 3 cánh',1,'2025-08-27 21:07:04'),(14,'Đèn LED',5,'Đèn chiếu sáng 20W',1,'2025-08-27 21:07:04'),(15,'Ổ cắm điện',5,'Ổ cắm 3 chấu',1,'2025-08-27 21:07:04'),(16,'Quạt trần',6,'Quạt trần 3 cánh',1,'2025-08-27 21:07:04'),(17,'Đèn LED',6,'Đèn chiếu sáng 20W',1,'2025-08-27 21:07:04'),(18,'Ổ cắm điện',6,'Ổ cắm 3 chấu',1,'2025-08-27 21:07:04'),(19,'Quạt trần',7,'Quạt trần 3 cánh',1,'2025-08-27 21:07:04'),(20,'Đèn LED',7,'Đèn chiếu sáng 20W',1,'2025-08-27 21:07:04'),(21,'Ổ cắm điện',7,'Ổ cắm 3 chấu',1,'2025-08-27 21:07:04'),(22,'Quạt trần',8,'Quạt trần 3 cánh',1,'2025-08-27 21:07:04'),(23,'Đèn LED',8,'Đèn chiếu sáng 20W',1,'2025-08-27 21:07:04'),(24,'Ổ cắm điện',8,'Ổ cắm 3 chấu',1,'2025-08-27 21:07:04'),(25,'Quạt trần',9,'Quạt trần 3 cánh',1,'2025-08-27 21:07:04'),(26,'Đèn LED',9,'Đèn chiếu sáng 20W',1,'2025-08-27 21:07:04'),(27,'Ổ cắm điện',9,'Ổ cắm 3 chấu',1,'2025-08-27 21:07:04'),(28,'Quạt trần',10,'Quạt trần 3 cánh',1,'2025-08-27 21:07:04'),(29,'Đèn LED',10,'Đèn chiếu sáng 20W',1,'2025-08-27 21:07:04'),(30,'Ổ cắm điện',10,'Ổ cắm 3 chấu',1,'2025-08-27 21:07:04'),(31,'Quạt trần',11,'Quạt trần 3 cánh',1,'2025-08-27 21:07:04'),(32,'Đèn LED',11,'Đèn chiếu sáng 20W',1,'2025-08-27 21:07:04'),(33,'Ổ cắm điện',11,'Ổ cắm 3 chấu',1,'2025-08-27 21:07:04'),(34,'Quạt trần',12,'Quạt trần 3 cánh',1,'2025-08-27 21:07:04'),(35,'Đèn LED',12,'Đèn chiếu sáng 20W',1,'2025-08-27 21:07:04'),(36,'Ổ cắm điện',12,'Ổ cắm 3 chấu',1,'2025-08-27 21:07:04'),(37,'Quạt trần',13,'Quạt trần 3 cánh',1,'2025-08-27 21:07:04'),(38,'Đèn LED',13,'Đèn chiếu sáng 20W',1,'2025-08-27 21:07:04'),(39,'Ổ cắm điện',13,'Ổ cắm 3 chấu',1,'2025-08-27 21:07:04'),(40,'Quạt trần',14,'Quạt trần 3 cánh',1,'2025-08-27 21:07:04'),(41,'Đèn LED',14,'Đèn chiếu sáng 20W',1,'2025-08-27 21:07:04'),(42,'Ổ cắm điện',14,'Ổ cắm 3 chấu',1,'2025-08-27 21:07:04'),(43,'Quạt trần',15,'Quạt trần 3 cánh',1,'2025-08-27 21:07:04'),(44,'Đèn LED',15,'Đèn chiếu sáng 20W',1,'2025-08-27 21:07:04'),(45,'Ổ cắm điện',15,'Ổ cắm 3 chấu',1,'2025-08-27 21:07:04'),(46,'Quạt trần',16,'Quạt trần 3 cánh',1,'2025-08-27 21:07:04'),(47,'Đèn LED',16,'Đèn chiếu sáng 20W',1,'2025-08-27 21:07:04'),(48,'Ổ cắm điện',16,'Ổ cắm 3 chấu',1,'2025-08-27 21:07:04'),(49,'Quạt trần',17,'Quạt trần 3 cánh',1,'2025-08-27 21:07:04'),(50,'Đèn LED',17,'Đèn chiếu sáng 20W',1,'2025-08-27 21:07:04'),(51,'Ổ cắm điện',17,'Ổ cắm 3 chấu',1,'2025-08-27 21:07:04');
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `electricitymeters`
--

DROP TABLE IF EXISTS `electricitymeters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `electricitymeters` (
  `meter_id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `month` date NOT NULL,
  `old_reading` int NOT NULL,
  `new_reading` int NOT NULL,
  `electricity_rate` decimal(10,2) DEFAULT '3500.00',
  `usage_kwh` int GENERATED ALWAYS AS ((`new_reading` - `old_reading`)) STORED,
  `total_amount` decimal(10,2) GENERATED ALWAYS AS (((`new_reading` - `old_reading`) * `electricity_rate`)) STORED,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`meter_id`),
  UNIQUE KEY `room_id` (`room_id`,`month`),
  CONSTRAINT `electricitymeters_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `electricitymeters`
--

LOCK TABLES `electricitymeters` WRITE;
/*!40000 ALTER TABLE `electricitymeters` DISABLE KEYS */;
INSERT INTO `electricitymeters` (`meter_id`, `room_id`, `month`, `old_reading`, `new_reading`, `electricity_rate`, `created_at`) VALUES (1,1,'2025-07-01',1000,1200,3500.00,'2025-08-27 14:07:04'),(2,2,'2025-07-01',1500,1800,3500.00,'2025-08-27 14:07:04'),(3,3,'2025-07-01',2000,2300,3500.00,'2025-08-27 14:07:04'),(4,4,'2025-07-01',2500,2700,3500.00,'2025-08-27 14:07:04'),(5,5,'2025-07-01',3000,3100,3500.00,'2025-08-27 14:07:04'),(6,6,'2025-07-01',3500,3800,3500.00,'2025-08-27 14:07:04'),(7,7,'2025-07-01',4000,4300,3500.00,'2025-08-27 14:07:04'),(8,8,'2025-07-01',4500,4800,3500.00,'2025-08-27 14:07:04'),(9,9,'2025-07-01',5000,5100,3500.00,'2025-08-27 14:07:04'),(10,10,'2025-07-01',5500,5800,3500.00,'2025-08-27 14:07:04');
/*!40000 ALTER TABLE `electricitymeters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoicedetails`
--

DROP TABLE IF EXISTS `invoicedetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoicedetails` (
  `detail_id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int NOT NULL,
  `meter_id` int DEFAULT NULL,
  `fee_type` enum('Rent','Electricity','Trash','Water','Wifi','Other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`detail_id`),
  KEY `invoice_id` (`invoice_id`),
  KEY `meter_id` (`meter_id`),
  CONSTRAINT `invoicedetails_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`) ON DELETE CASCADE,
  CONSTRAINT `invoicedetails_ibfk_2` FOREIGN KEY (`meter_id`) REFERENCES `electricitymeters` (`meter_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoicedetails`
--

LOCK TABLES `invoicedetails` WRITE;
/*!40000 ALTER TABLE `invoicedetails` DISABLE KEYS */;
INSERT INTO `invoicedetails` VALUES (1,1,1,'Rent',3000000.00,'Tiền thuê tháng 1'),(2,1,1,'Electricity',700000.00,'Tiền điện tháng 1'),(3,2,2,'Rent',5000000.00,'Tiền thuê tháng 1'),(4,2,2,'Electricity',1050000.00,'Tiền điện tháng 1'),(5,3,3,'Rent',7000000.00,'Tiền thuê tháng 1'),(6,3,3,'Electricity',1050000.00,'Tiền điện tháng 1'),(7,4,4,'Rent',6000000.00,'Tiền thuê tháng 1'),(8,4,4,'Electricity',700000.00,'Tiền điện tháng 1'),(9,5,5,'Rent',2500000.00,'Tiền thuê tháng 1'),(10,5,5,'Electricity',350000.00,'Tiền điện tháng 1'),(11,6,6,'Rent',4500000.00,'Tiền thuê tháng 1'),(12,6,6,'Electricity',1050000.00,'Tiền điện tháng 1'),(13,7,7,'Rent',8000000.00,'Tiền thuê tháng 1'),(14,7,7,'Electricity',1050000.00,'Tiền điện tháng 1'),(15,8,8,'Rent',10000000.00,'Tiền thuê tháng 1'),(16,8,8,'Electricity',1050000.00,'Tiền điện tháng 1'),(17,9,9,'Rent',2000000.00,'Tiền thuê tháng 1'),(18,9,9,'Electricity',350000.00,'Tiền điện tháng 1'),(19,10,10,'Rent',12000000.00,'Tiền thuê tháng 1'),(20,10,10,'Electricity',1050000.00,'Tiền điện tháng 1');
/*!40000 ALTER TABLE `invoicedetails` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_after_insert_invoice_detail` AFTER INSERT ON `invoicedetails` FOR EACH ROW BEGIN
    UPDATE Invoices
    SET total_amount = (
        SELECT IFNULL(SUM(amount), 0)
        FROM InvoiceDetails
        WHERE invoice_id = NEW.invoice_id
    )
    WHERE invoice_id = NEW.invoice_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_after_update_invoice_detail` AFTER UPDATE ON `invoicedetails` FOR EACH ROW BEGIN
    UPDATE Invoices
    SET total_amount = (
        SELECT IFNULL(SUM(amount), 0)
        FROM InvoiceDetails
        WHERE invoice_id = NEW.invoice_id
    )
    WHERE invoice_id = NEW.invoice_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_after_delete_invoice_detail` AFTER DELETE ON `invoicedetails` FOR EACH ROW BEGIN
    UPDATE Invoices
    SET total_amount = (
        SELECT IFNULL(SUM(amount), 0)
        FROM InvoiceDetails
        WHERE invoice_id = OLD.invoice_id
    )
    WHERE invoice_id = OLD.invoice_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `invoice_id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `month` date NOT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `is_paid` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`invoice_id`),
  UNIQUE KEY `room_id` (`room_id`,`month`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,1,'2025-01-01',3700000.00,0,'2025-08-27 14:07:04'),(2,2,'2025-01-01',6050000.00,1,'2025-08-27 14:07:04'),(3,3,'2025-01-01',8050000.00,0,'2025-08-27 14:07:04'),(4,4,'2025-01-01',6700000.00,1,'2025-08-27 14:07:04'),(5,5,'2025-01-01',2850000.00,0,'2025-08-27 14:07:04'),(6,6,'2025-01-01',5550000.00,1,'2025-08-27 14:07:04'),(7,7,'2025-01-01',9050000.00,0,'2025-08-27 14:07:04'),(8,8,'2025-01-01',11050000.00,1,'2025-08-27 14:07:04'),(9,9,'2025-01-01',2350000.00,0,'2025-08-27 14:07:04'),(10,10,'2025-01-01',13050000.00,1,'2025-08-27 14:07:04');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'Hóa đơn tháng 1','Hóa đơn tháng 1 đã được tạo, vui lòng thanh toán trước ngày 10',0,'2025-08-27 14:07:04'),(2,2,'Hóa đơn tháng 1','Hóa đơn tháng 1 đã được thanh toán',1,'2025-08-27 14:07:04'),(3,3,'Hóa đơn tháng 1','Hóa đơn tháng 1 đã được tạo, vui lòng thanh toán trước ngày 10',0,'2025-08-27 14:07:04'),(4,4,'Hóa đơn tháng 1','Hóa đơn tháng 1 đã được thanh toán',1,'2025-08-27 14:07:04'),(5,5,'Hóa đơn tháng 1','Hóa đơn tháng 1 đã được tạo, vui lòng thanh toán trước ngày 10',0,'2025-08-27 14:07:04'),(6,6,'Hóa đơn tháng 1','Hóa đơn tháng 1 đã được thanh toán',1,'2025-08-27 14:07:04'),(7,7,'Hóa đơn tháng 1','Hóa đơn tháng 1 đã được tạo, vui lòng thanh toán trước ngày 10',0,'2025-08-27 14:07:04'),(8,8,'Hóa đơn tháng 1','Hóa đơn tháng 1 đã được thanh toán',1,'2025-08-27 14:07:04'),(9,9,'Hóa đơn tháng 1','Hóa đơn tháng 1 đã được tạo, vui lòng thanh toán trước ngày 10',0,'2025-08-27 14:07:04'),(10,10,'Hóa đơn tháng 1','Hóa đơn tháng 1 đã được thanh toán',1,'2025-08-27 14:07:04');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int NOT NULL,
  `paid_amount` decimal(12,2) NOT NULL,
  `payment_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `payment_method` enum('Cash','BankTransfer','Momo','ZaloPay','Other') COLLATE utf8mb4_unicode_ci DEFAULT 'Cash',
  `transaction_reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`payment_id`),
  KEY `invoice_id` (`invoice_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,2,5500000.00,'2025-01-05 10:00:00','Momo','MM123456','Thanh toán hóa đơn tháng 1'),(2,4,6500000.00,'2025-01-06 11:00:00','BankTransfer','BT123456','Thanh toán hóa đơn tháng 1'),(3,6,5000000.00,'2025-01-07 12:00:00','Cash',NULL,'Thanh toán hóa đơn tháng 1'),(4,8,10500000.00,'2025-01-08 13:00:00','ZaloPay','ZP123456','Thanh toán hóa đơn tháng 1'),(5,10,12500000.00,'2025-01-09 14:00:00','Momo','MM789012','Thanh toán hóa đơn tháng 1'),(6,2,5500000.00,'2025-02-05 10:00:00','Momo','MM123457','Thanh toán hóa đơn tháng 2'),(7,4,6500000.00,'2025-02-06 11:00:00','BankTransfer','BT123457','Thanh toán hóa đơn tháng 2'),(8,6,5000000.00,'2025-02-07 12:00:00','Cash',NULL,'Thanh toán hóa đơn tháng 2'),(9,8,10500000.00,'2025-02-08 13:00:00','ZaloPay','ZP123457','Thanh toán hóa đơn tháng 2'),(10,10,12500000.00,'2025-02-09 14:00:00','Momo','MM789013','Thanh toán hóa đơn tháng 2');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservations` (
  `reservation_id` int NOT NULL AUTO_INCREMENT,
  `contact_phone` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `status` enum('Pending','Confirmed','Cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reservation_id`),
  KEY `user_id` (`user_id`),
  KEY `room_id` (`room_id`),
  KEY `idx_reservation_id` (`reservation_id`),
  CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
/*!40000 ALTER TABLE `reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roomimages`
--

DROP TABLE IF EXISTS `roomimages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roomimages` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`image_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `roomimages_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roomimages`
--

LOCK TABLES `roomimages` WRITE;
/*!40000 ALTER TABLE `roomimages` DISABLE KEYS */;
INSERT INTO `roomimages` VALUES (7,1,'/roomImage/z6940362676401-b621b666f1c25bac5c925f94a98c0450_1756109065.jpg'),(8,1,'/roomImage/z6940362703310-b4d2f327f6f35440a1ac2e37d1afefd9_1756109065.jpg'),(9,1,'/roomImage/z6940363127401-f14718e5add3c00568de793b03d5be23_1756109074.jpg');
/*!40000 ALTER TABLE `roomimages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `room_id` int NOT NULL AUTO_INCREMENT,
  `room_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_type_id` int NOT NULL,
  `max_occupants` int DEFAULT '1',
  `is_available` tinyint(1) DEFAULT '0',
  `floor_number` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`room_id`),
  UNIQUE KEY `room_number` (`room_number`),
  KEY `room_type_id` (`room_type_id`),
  CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `roomtypes` (`room_type_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,'Phòng 1A',1,4,1,0,''),(2,'Phòng 2A',1,4,0,0,NULL),(3,'Phòng 3A',1,4,0,0,NULL),(4,'Phòng 4A',1,4,0,0,NULL),(5,'Phòng 5A',1,4,0,0,NULL),(6,'Phòng 6A',1,4,0,0,NULL),(7,'Phòng 7A',1,4,0,0,NULL),(8,'Phòng 8A',1,4,0,0,NULL),(9,'Phòng 1B',1,4,0,0,NULL),(10,'Phòng 2B',1,4,0,0,NULL),(11,'Phòng 3B',1,4,0,0,NULL),(12,'Phòng 4B',1,4,0,0,NULL),(13,'Phòng 5B',1,4,0,0,NULL),(14,'Phòng 6B',1,4,0,0,NULL),(15,'Phòng 7B',1,4,0,0,NULL),(16,'Phòng 8B',1,4,0,0,NULL),(17,'Phòng 9B',1,4,0,0,NULL);
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roomtypes`
--

DROP TABLE IF EXISTS `roomtypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roomtypes` (
  `room_type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price_per_month` decimal(10,2) NOT NULL,
  PRIMARY KEY (`room_type_id`),
  UNIQUE KEY `type_name` (`type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roomtypes`
--

LOCK TABLES `roomtypes` WRITE;
/*!40000 ALTER TABLE `roomtypes` DISABLE KEYS */;
INSERT INTO `roomtypes` VALUES (1,'Standard','Phòng cơ bản, không điều hòa',3000000.00),(2,'Deluxe','Phòng có điều hòa, ban công',5000000.00),(3,'Premium','Phòng rộng, đầy đủ tiện nghi',7000000.00),(4,'Studio','Phòng studio, bếp riêng',6000000.00),(5,'Single','Phòng đơn, nhỏ gọn',2500000.00),(6,'Double','Phòng đôi, 2 giường',4500000.00),(7,'Family','Phòng gia đình, 3-4 người',8000000.00),(8,'VIP','Phòng cao cấp, view đẹp',10000000.00),(9,'Economy','Phòng tiết kiệm, tiện nghi cơ bản',2000000.00),(10,'Luxury','Phòng sang trọng, đầy đủ tiện nghi',12000000.00);
/*!40000 ALTER TABLE `roomtypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `tenant_id` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('Male','Female','Other') COLLATE utf8mb4_unicode_ci DEFAULT 'Other',
  `date_of_birth` date DEFAULT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_card_front_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_card_back_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_rent` tinyint(1) DEFAULT '1',
  `address` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES ('079203029606','Huỳnh Vĩ Khang','Male','2003-05-28','0767487840','huynhvikhang913@gmail.com','/public/cccd/front_079203029607.jpg','/public/cccd/back_079203029607.jpg',1,'5/5A Nguyễn Thị Sóc, Bà Điểm, Hóc Môn, TP.HCM','2025-08-27 14:07:04'),('079203029607','Nguyen Van An','Male','1990-05-15','0905123456','an.nguyen@example.com','/idcards/T001_front.jpg','/idcards/T001_back.jpg',1,'123 Le Loi, Q1, HCMC','2025-08-27 14:07:04'),('079203029608','Tran Thi Bich','Female','1995-08-22','0912345678','bich.tran@example.com','/idcards/T002_front.jpg','/idcards/T002_back.jpg',1,'456 Nguyen Hue, Q1, HCMC','2025-08-27 14:07:04'),('079203029609','Le Van Cuong','Male','1988-03-10','0923456789','cuong.le@example.com','/idcards/T003_front.jpg','/idcards/T003_back.jpg',1,'789 Tran Hung Dao, Q5, HCMC','2025-08-27 14:07:04'),('079203029610','Pham Thi Dung','Female','1993-11-30','0934567890','dung.pham@example.com','/idcards/T004_front.jpg','/idcards/T004_back.jpg',1,'101 Vo Van Tan, Q3, HCMC','2025-08-27 14:07:04'),('079203029611','Hoang Van Em','Male','1992-07-25','0945678901','em.hoang@example.com','/idcards/T005_front.jpg','/idcards/T005_back.jpg',1,'202 Ly Tu Trong, Q1, HCMC','2025-08-27 14:07:04'),('079203029612','Vo Thi Phuong','Female','1996-02-14','0956789012','phuong.vo@example.com','/idcards/T006_front.jpg','/idcards/T006_back.jpg',1,'303 Hai Ba Trung, Q3, HCMC','2025-08-27 14:07:04'),('079203029613','Nguyen Van Hung','Male','1985-09-05','0967890123','hung.nguyen@example.com','/idcards/T007_front.jpg','/idcards/T007_back.jpg',1,'404 Nguyen Trai, Q5, HCMC','2025-08-27 14:07:04'),('079203029614','Tran Van Khanh','Male','1991-12-20','0978901234','khanh.tran@example.com','/idcards/T008_front.jpg','/idcards/T008_back.jpg',1,'505 Le Van Sy, Q3, HCMC','2025-08-27 14:07:04'),('079203029615','Le Thi Lan','Female','1994-04-18','0989012345','lan.le@example.com','/idcards/T009_front.jpg','/idcards/T009_back.jpg',1,'606 Cach Mang Thang 8, Q3, HCMC','2025-08-27 14:07:04'),('079203029616','Pham Van Minh','Male','1989-06-12','0990123456','minh.pham@example.com','/idcards/T010_front.jpg','/idcards/T010_back.jpg',1,'707 Nguyen Dinh Chieu, Q3, HCMC','2025-08-27 14:07:04');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `role` enum('USER','ADMIN') COLLATE utf8mb4_unicode_ci DEFAULT 'USER',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'an.nguyen','an.nguyen@example.com','$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e','079203029607',NULL,NULL,NULL,'USER',1,'2025-08-27 14:07:04','2025-08-27 14:07:04'),(2,'bich.tran','bich.tran@example.com','$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e','079203029608',NULL,NULL,NULL,'USER',1,'2025-08-27 14:07:04','2025-08-27 14:07:04'),(3,'cuong.le','cuong.le@example.com','$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e','079203029609',NULL,NULL,NULL,'USER',1,'2025-08-27 14:07:04','2025-08-27 14:07:04'),(4,'dung.pham','dung.pham@example.com','$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e','079203029610',NULL,NULL,NULL,'USER',1,'2025-08-27 14:07:04','2025-08-27 14:07:04'),(5,'em.hoang','em.hoang@example.com','$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e','079203029611',NULL,NULL,NULL,'USER',1,'2025-08-27 14:07:04','2025-08-27 14:07:04'),(6,'phuong.vo','phuong.vo@example.com','$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e','079203029612',NULL,NULL,NULL,'USER',1,'2025-08-27 14:07:04','2025-08-27 14:07:04'),(7,'hung.nguyen','hung.nguyen@example.com','$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e','079203029613',NULL,NULL,NULL,'USER',1,'2025-08-27 14:07:04','2025-08-27 14:07:04'),(8,'duc.hieu','nguyenduchieu@example.com','$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e','079203029614',NULL,NULL,NULL,'USER',1,'2025-08-27 14:07:04','2025-08-27 14:07:04'),(9,'gia.hieu','giahieu@example.com','$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e','079203029615',NULL,NULL,NULL,'USER',1,'2025-08-27 14:07:04','2025-08-27 14:07:04'),(10,'dinh.khoa','minh.pham@example.com','$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e','079203029616',NULL,NULL,NULL,'USER',1,'2025-08-27 14:07:04','2025-08-27 14:07:04'),(11,'admin1','admin1@example.com','$2a$12$YbgMrDVLpsncrlxrjam0EO4yosTojsqK5nqs1sIhgW/aGz5QsHO0e',NULL,NULL,NULL,NULL,'ADMIN',1,'2025-08-27 14:07:04','2025-08-27 14:07:04');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-27 21:10:52
