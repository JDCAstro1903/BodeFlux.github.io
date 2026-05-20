
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `inventory_items`
--

DROP TABLE IF EXISTS `inventory_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` float NOT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lot_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiry_date` date NOT NULL,
  `location` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider_id` int DEFAULT NULL,
  `receipt_date` date NOT NULL,
  `status` enum('active','output','waste') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT (now()),
  `updated_at` datetime DEFAULT (now()),
  `product_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `provider_id` (`provider_id`),
  KEY `ix_inventory_items_id` (`id`),
  KEY `ix_inventory_items_lot_number` (`lot_number`),
  KEY `idx_ii_product_id` (`product_id`),
  CONSTRAINT `inventory_items_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_items`
--

/*!40000 ALTER TABLE `inventory_items` DISABLE KEYS */;
INSERT INTO `inventory_items` VALUES (38,'Fertilizante Orgánico Premium','Fertilizantes',80,'kg','LOT-2026-001','2026-05-22','Pasillo A-1','AgroNutrientes SA',12,'2026-03-15','active','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(39,'Semilla de Maíz Híbrido','Semillas',45,'bolsa','LOT-2026-002','2026-06-05','Pasillo B-2','SemiPro México',13,'2026-04-29','active','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(40,'Insecticida Cipermetrina','Pesticidas',20,'L','LOT-2026-003','2026-08-17','Pasillo C-1','ProteCampo',14,'2026-05-09','active','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(41,'Urea Granulada 46-0-0','Fertilizantes',120,'kg','LOT-2026-004','2026-11-15','Pasillo A-2','BioAgro Solutions',16,'2026-05-04','active','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(42,'Herbicida Glifosato','Herbicidas',25,'L','LOT-2026-005','2026-05-11','Pasillo B-3','HerbiMax',15,'2026-03-10','active','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(43,'NPK 20-20-20 Soluble','Fertilizantes',28,'kg','LOT-2026-006','2026-05-20','Pasillo C-3','AgroNutrientes SA',12,'2026-03-30','active','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(44,'Semilla de Trigo','Semillas',100,'kg','LOT-2026-007','2026-07-18','Pasillo A-3','SemiPro México',13,'2026-04-24','active','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(45,'Fungicida Cúprico','Pesticidas',18,'L','LOT-2026-008','2026-06-01','Pasillo B-1','ProteCampo',14,'2026-05-06','active','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(46,'Sulfato de Amonio','Fertilizantes',200,'kg','LOT-2026-009','2026-12-10','Pasillo D-1','BioAgro Solutions',16,'2026-05-02','active','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(47,'Semilla de Frijol Negro','Semillas',60,'kg','LOT-2026-010','2026-09-11','Pasillo B-4','Semillas del Campo MX',17,'2026-04-26','active','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(48,'Semilla de Chile Habanero','Semillas',40,'bolsa','LOT-2026-011','2026-08-12','Pasillo B-5','Semillas del Campo MX',17,'2026-05-07','active','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(49,'Bioestimulante Radical','Otros',30,'L','LOT-2026-012','2026-10-11','Pasillo D-2','BioAgro Solutions',16,'2026-05-11','active','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(50,'Herbicida Glifosato','Herbicidas',40,'L','LOT-2025-H01','2026-04-14','Pasillo B-3','HerbiMax',15,'2025-11-15','output','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(51,'Fertilizante Orgánico Premium','Fertilizantes',50,'kg','LOT-2025-H02','2026-06-13','Pasillo A-1','AgroNutrientes SA',12,'2025-12-15','output','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(52,'Urea Granulada 46-0-0','Fertilizantes',80,'kg','LOT-2025-H03','2026-05-29','Pasillo A-2','BioAgro Solutions',16,'2026-01-14','output','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(53,'Insecticida Cipermetrina','Pesticidas',12,'L','LOT-2025-H04','2026-05-04','Pasillo C-1','ProteCampo',14,'2025-10-26','waste','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(54,'Semilla de Maíz Híbrido','Semillas',20,'bolsa','LOT-2025-H05','2026-05-09','Pasillo B-2','SemiPro México',13,'2025-09-06','output','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(55,'NPK 20-20-20 Soluble','Fertilizantes',15,'kg','LOT-2025-H06','2026-04-24','Pasillo C-3','AgroNutrientes SA',12,'2025-07-18','waste','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(56,'Semilla de Trigo','Semillas',150,'kg','LOT-2025-H07','2026-05-24','Pasillo A-3','Semillas del Campo MX',17,'2025-08-17','output','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(57,'Sulfato de Amonio','Fertilizantes',300,'kg','LOT-2025-H08','2026-07-13','Pasillo D-1','BioAgro Solutions',16,'2025-06-28','output','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(58,'Fungicida Cúprico','Pesticidas',10,'L','LOT-2025-H09','2026-04-29','Pasillo B-1','ProteCampo',14,'2025-06-08','waste','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(59,'Herbicida Glifosato','Herbicidas',30,'L','LOT-2025-H10','2026-06-08','Pasillo B-3','HerbiMax',15,'2025-05-19','output','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(60,'Bioestimulante Radical','Otros',8,'L','LOT-2025-H11','2026-05-06','Pasillo D-2','BioAgro Solutions',16,'2025-04-29','waste','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL),(61,'Semilla de Frijol Negro','Semillas',35,'kg','LOT-2025-H12','2026-05-19','Pasillo B-4','Semillas del Campo MX',17,'2025-04-09','output','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL);
/*!40000 ALTER TABLE `inventory_items` ENABLE KEYS */;

--
-- Table structure for table `inventory_movements`
--

DROP TABLE IF EXISTS `inventory_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_movements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inventory_item_id` int NOT NULL,
  `movement_type` enum('entry','output','waste') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` float NOT NULL,
  `user_id` int DEFAULT NULL,
  `destination` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `inventory_item_id` (`inventory_item_id`),
  KEY `user_id` (`user_id`),
  KEY `ix_inventory_movements_id` (`id`),
  CONSTRAINT `inventory_movements_ibfk_1` FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items` (`id`),
  CONSTRAINT `inventory_movements_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_movements`
--

/*!40000 ALTER TABLE `inventory_movements` DISABLE KEYS */;
INSERT INTO `inventory_movements` VALUES (52,38,'entry',80,7,NULL,'Entrada: Fertilizante Orgánico Premium','2026-05-14 15:54:09'),(53,39,'entry',45,7,NULL,'Entrada: Semilla de Maíz Híbrido','2026-05-14 15:54:09'),(54,40,'entry',20,7,NULL,'Entrada: Insecticida Cipermetrina','2026-05-14 15:54:09'),(55,41,'entry',120,7,NULL,'Entrada: Urea Granulada 46-0-0','2026-05-14 15:54:09'),(56,42,'entry',25,7,NULL,'Entrada: Herbicida Glifosato','2026-05-14 15:54:09'),(57,43,'entry',28,7,NULL,'Entrada: NPK 20-20-20 Soluble','2026-05-14 15:54:09'),(58,44,'entry',100,7,NULL,'Entrada: Semilla de Trigo','2026-05-14 15:54:09'),(59,45,'entry',18,7,NULL,'Entrada: Fungicida Cúprico','2026-05-14 15:54:09'),(60,46,'entry',200,7,NULL,'Entrada: Sulfato de Amonio','2026-05-14 15:54:09'),(61,47,'entry',60,7,NULL,'Entrada: Semilla de Frijol Negro','2026-05-14 15:54:09'),(62,48,'entry',40,7,NULL,'Entrada: Semilla de Chile Habanero','2026-05-14 15:54:09'),(63,49,'entry',30,7,NULL,'Entrada: Bioestimulante Radical','2026-05-14 15:54:09'),(64,50,'entry',40,7,NULL,'Entrada: Herbicida Glifosato','2026-05-14 15:54:09'),(65,50,'output',40,7,NULL,'Salida: Herbicida Glifosato','2026-05-14 15:54:09'),(66,51,'entry',50,7,NULL,'Entrada: Fertilizante Orgánico Premium','2026-05-14 15:54:09'),(67,51,'output',50,7,NULL,'Salida: Fertilizante Orgánico Premium','2026-05-14 15:54:09'),(68,52,'entry',80,7,NULL,'Entrada: Urea Granulada 46-0-0','2026-05-14 15:54:09'),(69,52,'output',80,7,NULL,'Salida: Urea Granulada 46-0-0','2026-05-14 15:54:09'),(70,53,'entry',12,7,NULL,'Entrada: Insecticida Cipermetrina','2026-05-14 15:54:09'),(71,54,'entry',20,7,NULL,'Entrada: Semilla de Maíz Híbrido','2026-05-14 15:54:09'),(72,54,'output',20,7,NULL,'Salida: Semilla de Maíz Híbrido','2026-05-14 15:54:09'),(73,55,'entry',15,7,NULL,'Entrada: NPK 20-20-20 Soluble','2026-05-14 15:54:09'),(74,56,'entry',150,7,NULL,'Entrada: Semilla de Trigo','2026-05-14 15:54:09'),(75,56,'output',150,7,NULL,'Salida: Semilla de Trigo','2026-05-14 15:54:09'),(76,57,'entry',300,7,NULL,'Entrada: Sulfato de Amonio','2026-05-14 15:54:09'),(77,57,'output',300,7,NULL,'Salida: Sulfato de Amonio','2026-05-14 15:54:09'),(78,58,'entry',10,7,NULL,'Entrada: Fungicida Cúprico','2026-05-14 15:54:09'),(79,59,'entry',30,7,NULL,'Entrada: Herbicida Glifosato','2026-05-14 15:54:09'),(80,59,'output',30,7,NULL,'Salida: Herbicida Glifosato','2026-05-14 15:54:09'),(81,60,'entry',8,7,NULL,'Entrada: Bioestimulante Radical','2026-05-14 15:54:09'),(82,61,'entry',35,7,NULL,'Entrada: Semilla de Frijol Negro','2026-05-14 15:54:09'),(83,61,'output',35,7,NULL,'Salida: Semilla de Frijol Negro','2026-05-14 15:54:09');
/*!40000 ALTER TABLE `inventory_movements` ENABLE KEYS */;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stock` float DEFAULT NULL,
  `price` float NOT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('available','low','out') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_emoji` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT (now()),
  `updated_at` datetime DEFAULT (now()),
  `provider_id` int DEFAULT NULL,
  `provider_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_products_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (27,'Fertilizante Orgánico Premium','Fertilizantes',320,285,'kg','available','?','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL,NULL),(28,'Urea Granulada 46-0-0','Fertilizantes',480,340,'kg','available','⚗️','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL,NULL),(29,'Semilla de Maíz Híbrido','Semillas',160,520,'bolsa','available','?','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL,NULL),(30,'Semilla de Frijol Negro','Semillas',95,180,'kg','available','?','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL,NULL),(31,'Insecticida Cipermetrina','Pesticidas',75,450,'L','available','?','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL,NULL),(32,'Herbicida Glifosato','Herbicidas',110,380,'L','available','?','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL,NULL),(33,'NPK 20-20-20 Soluble','Fertilizantes',28,290,'kg','low','?','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL,NULL),(34,'Semilla de Trigo','Semillas',220,250,'kg','available','?','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL,NULL),(35,'Fungicida Cúprico','Pesticidas',45,620,'L','available','?','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL,NULL),(36,'Bioestimulante Radical','Otros',30,750,'L','available','?','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL,NULL),(37,'Sulfato de Amonio','Fertilizantes',540,195,'kg','available','?','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL,NULL),(38,'Semilla de Chile Habanero','Semillas',55,420,'bolsa','available','?️','2026-05-14 15:54:09','2026-05-14 15:54:09',NULL,NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;

--
-- Table structure for table `provider_order_items`
--

DROP TABLE IF EXISTS `provider_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provider_order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` float NOT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `ix_provider_order_items_id` (`id`),
  CONSTRAINT `provider_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `provider_orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provider_order_items`
--

/*!40000 ALTER TABLE `provider_order_items` DISABLE KEYS */;
INSERT INTO `provider_order_items` VALUES (1,1,'Test',10,'kg'),(2,2,'Fungicida Cúprico',10,'L'),(3,2,'Bioestimulante Radical',10,'L'),(4,2,'Test',10,'kg'),(5,3,'NPK 20-20-20 Soluble',10,'kg'),(6,4,'Test',10,'kg');
/*!40000 ALTER TABLE `provider_order_items` ENABLE KEYS */;

--
-- Table structure for table `provider_orders`
--

DROP TABLE IF EXISTS `provider_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provider_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider_id` int DEFAULT NULL,
  `provider_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','sent','received','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT (now()),
  `updated_at` datetime DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `provider_id` (`provider_id`),
  KEY `ix_provider_orders_id` (`id`),
  CONSTRAINT `provider_orders_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provider_orders`
--

/*!40000 ALTER TABLE `provider_orders` DISABLE KEYS */;
INSERT INTO `provider_orders` VALUES (1,NULL,NULL,'cancelled',NULL,'2026-05-13 16:08:15','2026-05-13 16:08:29'),(2,NULL,NULL,'received',NULL,'2026-05-13 16:09:01','2026-05-13 16:09:08'),(3,NULL,NULL,'pending',NULL,'2026-05-13 16:14:24','2026-05-13 16:14:24'),(4,NULL,NULL,'sent',NULL,'2026-05-13 16:23:40','2026-05-13 20:53:06');
/*!40000 ALTER TABLE `provider_orders` ENABLE KEYS */;

--
-- Table structure for table `providers`
--

DROP TABLE IF EXISTS `providers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `providers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` float DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT (now()),
  `updated_at` datetime DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `ix_providers_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `providers`
--

/*!40000 ALTER TABLE `providers` DISABLE KEYS */;
INSERT INTO `providers` VALUES (12,'AgroNutrientes SA','Juan Pérez','ventas@agronutrientes.com','+52 33 1234 5678','Av. Revolución 456, Guadalajara, JAL','Fertilizantes',4.8,'active','2026-05-14 15:54:09','2026-05-14 15:54:09'),(13,'SemiPro México','Ana Rodríguez','contacto@semipro.mx','+52 55 9876 5432','Calle Industrial 789, CDMX','Semillas',4.5,'active','2026-05-14 15:54:09','2026-05-14 15:54:09'),(14,'ProteCampo','Luis Martínez','info@protecampo.com','+52 81 5555 1234','Blvd. Agrícola 321, Monterrey, NL','Pesticidas',4.2,'active','2026-05-14 15:54:09','2026-05-14 15:54:09'),(15,'HerbiMax','Patricia Sánchez','ventas@herbimax.com','+52 33 7777 8888','Carr. Chapala km 12, Guadalajara, JAL','Herbicidas',4.6,'active','2026-05-14 15:54:09','2026-05-14 15:54:09'),(16,'BioAgro Solutions','Fernando Torres','fernando@bioagro.com','+52 55 4444 3333','Parque Industrial Norte 100, Querétaro, QRO','Fertilizantes',4.9,'active','2026-05-14 15:54:09','2026-05-14 15:54:09'),(17,'Semillas del Campo MX','Rosa Jiménez','rosa@semillascampo.mx','+52 44 2222 1111','Km 5 Carr. Morelia, Michoacán','Semillas',4.3,'active','2026-05-14 15:54:09','2026-05-14 15:54:09');
/*!40000 ALTER TABLE `providers` ENABLE KEYS */;

--
-- Table structure for table `sale_items`
--

DROP TABLE IF EXISTS `sale_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sale_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` float NOT NULL,
  `unit_price` float NOT NULL,
  `total_price` float NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sale_id` (`sale_id`),
  KEY `product_id` (`product_id`),
  KEY `ix_sale_items_id` (`id`),
  CONSTRAINT `sale_items_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`),
  CONSTRAINT `sale_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=439 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_items`
--

/*!40000 ALTER TABLE `sale_items` DISABLE KEYS */;
INSERT INTO `sale_items` VALUES (225,117,34,'Semilla de Trigo',6.2,250,1550),(226,117,27,'Fertilizante Orgánico Premium',2.3,285,655.5),(227,117,35,'Fungicida Cúprico',4.2,620,2604),(228,118,28,'Urea Granulada 46-0-0',9,340,3060),(229,118,37,'Sulfato de Amonio',6.2,195,1209),(230,119,38,'Semilla de Chile Habanero',10.1,420,4242),(231,120,28,'Urea Granulada 46-0-0',11.6,340,3944),(232,120,29,'Semilla de Maíz Híbrido',5.4,520,2808),(233,121,30,'Semilla de Frijol Negro',4.6,180,828),(234,121,36,'Bioestimulante Radical',2.4,750,1800),(235,122,27,'Fertilizante Orgánico Premium',4.9,285,1396.5),(236,122,34,'Semilla de Trigo',8.3,250,2075),(237,123,31,'Insecticida Cipermetrina',4.8,450,2160),(238,124,30,'Semilla de Frijol Negro',8.7,180,1566),(239,124,29,'Semilla de Maíz Híbrido',9,520,4680),(240,125,29,'Semilla de Maíz Híbrido',4.4,520,2288),(241,125,34,'Semilla de Trigo',6.6,250,1650),(242,125,38,'Semilla de Chile Habanero',4.7,420,1974),(243,126,30,'Semilla de Frijol Negro',4.3,180,774),(244,126,38,'Semilla de Chile Habanero',2.3,420,966),(245,126,27,'Fertilizante Orgánico Premium',5.2,285,1482),(246,127,37,'Sulfato de Amonio',8.6,195,1677),(247,127,30,'Semilla de Frijol Negro',6,180,1080),(248,127,29,'Semilla de Maíz Híbrido',11.1,520,5772),(249,128,29,'Semilla de Maíz Híbrido',9.4,520,4888),(250,129,31,'Insecticida Cipermetrina',5.6,450,2520),(251,129,35,'Fungicida Cúprico',12,620,7440),(252,130,38,'Semilla de Chile Habanero',2.5,420,1050),(253,131,36,'Bioestimulante Radical',7.3,750,5475),(254,131,33,'NPK 20-20-20 Soluble',11.7,290,3393),(255,132,31,'Insecticida Cipermetrina',3.1,450,1395),(256,132,37,'Sulfato de Amonio',6.3,195,1228.5),(257,133,31,'Insecticida Cipermetrina',7.1,450,3195),(258,133,35,'Fungicida Cúprico',3.1,620,1922),(259,133,29,'Semilla de Maíz Híbrido',8.3,520,4316),(260,134,29,'Semilla de Maíz Híbrido',5.7,520,2964),(261,135,27,'Fertilizante Orgánico Premium',6.9,285,1966.5),(262,135,36,'Bioestimulante Radical',3.1,750,2325),(263,135,31,'Insecticida Cipermetrina',5.6,450,2520),(264,136,36,'Bioestimulante Radical',11.5,750,8625),(265,137,35,'Fungicida Cúprico',4.7,620,2914),(266,137,30,'Semilla de Frijol Negro',10.7,180,1926),(267,138,38,'Semilla de Chile Habanero',4,420,1680),(268,138,37,'Sulfato de Amonio',5.1,195,994.5),(269,139,33,'NPK 20-20-20 Soluble',4.2,290,1218),(270,139,29,'Semilla de Maíz Híbrido',5.4,520,2808),(271,139,31,'Insecticida Cipermetrina',7.9,450,3555),(272,140,28,'Urea Granulada 46-0-0',9.1,340,3094),(273,141,32,'Herbicida Glifosato',2.7,380,1026),(274,142,31,'Insecticida Cipermetrina',3.3,450,1485),(275,142,35,'Fungicida Cúprico',11.4,620,7068),(276,143,37,'Sulfato de Amonio',2.5,195,487.5),(277,143,36,'Bioestimulante Radical',8.5,750,6375),(278,144,36,'Bioestimulante Radical',10,750,7500),(279,144,31,'Insecticida Cipermetrina',3.1,450,1395),(280,145,28,'Urea Granulada 46-0-0',3.8,340,1292),(281,145,32,'Herbicida Glifosato',6.6,380,2508),(282,146,28,'Urea Granulada 46-0-0',12,340,4080),(283,146,27,'Fertilizante Orgánico Premium',10.4,285,2964),(284,146,35,'Fungicida Cúprico',11.7,620,7254),(285,147,32,'Herbicida Glifosato',10.6,380,4028),(286,147,30,'Semilla de Frijol Negro',11,180,1980),(287,148,31,'Insecticida Cipermetrina',9.8,450,4410),(288,148,38,'Semilla de Chile Habanero',6.6,420,2772),(289,149,32,'Herbicida Glifosato',5,380,1900),(290,149,28,'Urea Granulada 46-0-0',11.7,340,3978),(291,149,29,'Semilla de Maíz Híbrido',7.8,520,4056),(292,150,27,'Fertilizante Orgánico Premium',6.8,285,1938),(293,150,34,'Semilla de Trigo',11.2,250,2800),(294,151,28,'Urea Granulada 46-0-0',2.7,340,918),(295,151,37,'Sulfato de Amonio',2.7,195,526.5),(296,151,29,'Semilla de Maíz Híbrido',10.6,520,5512),(297,152,31,'Insecticida Cipermetrina',2.4,450,1080),(298,152,34,'Semilla de Trigo',2.8,250,700),(299,153,33,'NPK 20-20-20 Soluble',11.3,290,3277),(300,153,37,'Sulfato de Amonio',11.4,195,2223),(301,154,28,'Urea Granulada 46-0-0',7.1,340,2414),(302,154,31,'Insecticida Cipermetrina',3.3,450,1485),(303,155,35,'Fungicida Cúprico',4.8,620,2976),(304,156,27,'Fertilizante Orgánico Premium',11.3,285,3220.5),(305,156,33,'NPK 20-20-20 Soluble',3,290,870),(306,157,30,'Semilla de Frijol Negro',4.7,180,846),(307,158,31,'Insecticida Cipermetrina',7.1,450,3195),(308,158,32,'Herbicida Glifosato',4.5,380,1710),(309,159,32,'Herbicida Glifosato',2,380,760),(310,159,27,'Fertilizante Orgánico Premium',9.7,285,2764.5),(311,160,36,'Bioestimulante Radical',3.1,750,2325),(312,160,27,'Fertilizante Orgánico Premium',11.5,285,3277.5),(313,161,35,'Fungicida Cúprico',7.8,620,4836),(314,162,33,'NPK 20-20-20 Soluble',5.6,290,1624),(315,163,38,'Semilla de Chile Habanero',11.7,420,4914),(316,163,37,'Sulfato de Amonio',9.5,195,1852.5),(317,163,32,'Herbicida Glifosato',11.3,380,4294),(318,164,38,'Semilla de Chile Habanero',6.1,420,2562),(319,165,37,'Sulfato de Amonio',10.6,195,2067),(320,165,35,'Fungicida Cúprico',10.1,620,6262),(321,166,28,'Urea Granulada 46-0-0',2.4,340,816),(322,166,32,'Herbicida Glifosato',6.7,380,2546),(323,166,37,'Sulfato de Amonio',4,195,780),(324,167,29,'Semilla de Maíz Híbrido',2.2,520,1144),(325,168,37,'Sulfato de Amonio',11.7,195,2281.5),(326,168,27,'Fertilizante Orgánico Premium',4.8,285,1368),(327,169,34,'Semilla de Trigo',9.9,250,2475),(328,169,32,'Herbicida Glifosato',6.4,380,2432),(329,169,38,'Semilla de Chile Habanero',11.8,420,4956),(330,170,30,'Semilla de Frijol Negro',9.1,180,1638),(331,170,31,'Insecticida Cipermetrina',2,450,900),(332,170,27,'Fertilizante Orgánico Premium',11.3,285,3220.5),(333,171,27,'Fertilizante Orgánico Premium',11.2,285,3192),(334,171,37,'Sulfato de Amonio',8.2,195,1599),(335,172,35,'Fungicida Cúprico',8.7,620,5394),(336,172,32,'Herbicida Glifosato',5.3,380,2014),(337,173,30,'Semilla de Frijol Negro',6.2,180,1116),(338,174,32,'Herbicida Glifosato',10.3,380,3914),(339,174,34,'Semilla de Trigo',5,250,1250),(340,174,35,'Fungicida Cúprico',4.1,620,2542),(341,175,34,'Semilla de Trigo',6.4,250,1600),(342,176,29,'Semilla de Maíz Híbrido',4.8,520,2496),(343,176,37,'Sulfato de Amonio',8.6,195,1677),(344,176,28,'Urea Granulada 46-0-0',8.2,340,2788),(345,177,31,'Insecticida Cipermetrina',3.5,450,1575),(346,177,30,'Semilla de Frijol Negro',2.5,180,450),(347,178,34,'Semilla de Trigo',6.1,250,1525),(348,179,35,'Fungicida Cúprico',6.6,620,4092),(349,180,34,'Semilla de Trigo',3.3,250,825),(350,181,33,'NPK 20-20-20 Soluble',10.2,290,2958),(351,181,34,'Semilla de Trigo',10.9,250,2725),(352,181,37,'Sulfato de Amonio',6.3,195,1228.5),(353,182,35,'Fungicida Cúprico',6.5,620,4030),(354,183,35,'Fungicida Cúprico',4.7,620,2914),(355,183,37,'Sulfato de Amonio',2.8,195,546),(356,183,31,'Insecticida Cipermetrina',4.9,450,2205),(357,184,28,'Urea Granulada 46-0-0',4.3,340,1462),(358,184,29,'Semilla de Maíz Híbrido',8.9,520,4628),(359,185,34,'Semilla de Trigo',7.4,250,1850),(360,185,33,'NPK 20-20-20 Soluble',6.2,290,1798),(361,186,27,'Fertilizante Orgánico Premium',6.8,285,1938),(362,186,36,'Bioestimulante Radical',11.4,750,8550),(363,186,34,'Semilla de Trigo',5,250,1250),(364,187,36,'Bioestimulante Radical',6.9,750,5175),(365,187,37,'Sulfato de Amonio',4.7,195,916.5),(366,187,31,'Insecticida Cipermetrina',6.9,450,3105),(367,188,34,'Semilla de Trigo',11.2,250,2800),(368,188,29,'Semilla de Maíz Híbrido',11.8,520,6136),(369,189,33,'NPK 20-20-20 Soluble',4.1,290,1189),(370,189,31,'Insecticida Cipermetrina',5.3,450,2385),(371,190,30,'Semilla de Frijol Negro',6.7,180,1206),(372,190,28,'Urea Granulada 46-0-0',9.5,340,3230),(373,191,28,'Urea Granulada 46-0-0',9.5,340,3230),(374,191,37,'Sulfato de Amonio',11.5,195,2242.5),(375,191,27,'Fertilizante Orgánico Premium',4,285,1140),(376,192,28,'Urea Granulada 46-0-0',6.7,340,2278),(377,193,38,'Semilla de Chile Habanero',9.7,420,4074),(378,193,30,'Semilla de Frijol Negro',3.7,180,666),(379,194,31,'Insecticida Cipermetrina',3.1,450,1395),(380,195,33,'NPK 20-20-20 Soluble',4,290,1160),(381,195,38,'Semilla de Chile Habanero',7.9,420,3318),(382,196,31,'Insecticida Cipermetrina',10.1,450,4545),(383,196,37,'Sulfato de Amonio',10,195,1950),(384,196,36,'Bioestimulante Radical',7.7,750,5775),(385,197,37,'Sulfato de Amonio',2.7,195,526.5),(386,197,32,'Herbicida Glifosato',8.5,380,3230),(387,198,28,'Urea Granulada 46-0-0',11.6,340,3944),(388,198,34,'Semilla de Trigo',8.4,250,2100),(389,199,38,'Semilla de Chile Habanero',7.9,420,3318),(390,199,37,'Sulfato de Amonio',5.2,195,1014),(391,200,29,'Semilla de Maíz Híbrido',6.6,520,3432),(392,200,37,'Sulfato de Amonio',8.1,195,1579.5),(393,201,38,'Semilla de Chile Habanero',3.8,420,1596),(394,201,30,'Semilla de Frijol Negro',4.1,180,738),(395,202,36,'Bioestimulante Radical',2.1,750,1575),(396,202,29,'Semilla de Maíz Híbrido',11.5,520,5980),(397,202,34,'Semilla de Trigo',2.9,250,725),(398,203,37,'Sulfato de Amonio',6.8,195,1326),(399,203,29,'Semilla de Maíz Híbrido',9.1,520,4732),(400,203,36,'Bioestimulante Radical',6.5,750,4875),(401,204,31,'Insecticida Cipermetrina',8.9,450,4005),(402,205,34,'Semilla de Trigo',5.4,250,1350),(403,205,33,'NPK 20-20-20 Soluble',12,290,3480),(404,206,32,'Herbicida Glifosato',4.5,380,1710),(405,206,29,'Semilla de Maíz Híbrido',3.2,520,1664),(406,206,30,'Semilla de Frijol Negro',3.9,180,702),(407,207,29,'Semilla de Maíz Híbrido',9.4,520,4888),(408,208,29,'Semilla de Maíz Híbrido',2.1,520,1092),(409,209,27,'Fertilizante Orgánico Premium',7.5,285,2137.5),(410,210,27,'Fertilizante Orgánico Premium',2.1,285,598.5),(411,210,38,'Semilla de Chile Habanero',4.8,420,2016),(412,211,27,'Fertilizante Orgánico Premium',4.5,285,1282.5),(413,212,30,'Semilla de Frijol Negro',6.9,180,1242),(414,213,37,'Sulfato de Amonio',7.6,195,1482),(415,214,33,'NPK 20-20-20 Soluble',9.6,290,2784),(416,215,28,'Urea Granulada 46-0-0',5.8,340,1972),(417,215,37,'Sulfato de Amonio',11.1,195,2164.5),(418,215,32,'Herbicida Glifosato',5,380,1900),(419,216,28,'Urea Granulada 46-0-0',7.5,340,2550),(420,217,37,'Sulfato de Amonio',6.7,195,1306.5),(421,217,36,'Bioestimulante Radical',2.3,750,1725),(422,218,27,'Fertilizante Orgánico Premium',4.3,285,1225.5),(423,218,37,'Sulfato de Amonio',4.6,195,897),(424,219,31,'Insecticida Cipermetrina',3.1,450,1395),(425,220,28,'Urea Granulada 46-0-0',2.6,340,884),(426,220,27,'Fertilizante Orgánico Premium',9.9,285,2821.5),(427,221,31,'Insecticida Cipermetrina',6.7,450,3015),(428,221,28,'Urea Granulada 46-0-0',5,340,1700),(429,222,32,'Herbicida Glifosato',8,380,3040),(430,222,31,'Insecticida Cipermetrina',10.9,450,4905),(431,222,27,'Fertilizante Orgánico Premium',9.3,285,2650.5),(432,223,29,'Semilla de Maíz Híbrido',11.6,520,6032),(433,224,29,'Semilla de Maíz Híbrido',9.6,520,4992),(434,224,35,'Fungicida Cúprico',3.8,620,2356),(435,224,27,'Fertilizante Orgánico Premium',7.2,285,2052),(436,225,31,'Insecticida Cipermetrina',11.7,450,5265),(437,225,36,'Bioestimulante Radical',6.7,750,5025),(438,225,32,'Herbicida Glifosato',6.1,380,2318);
/*!40000 ALTER TABLE `sale_items` ENABLE KEYS */;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `customer_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal` float NOT NULL,
  `tax` float NOT NULL,
  `total` float NOT NULL,
  `status` enum('pending','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `ix_sales_id` (`id`),
  CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=226 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (117,8,'Finca Los Cedros',4809.5,769.52,5579.02,'completed','2025-05-01 09:43:00'),(118,8,'Rancho Las Palmas',4269,683.04,4952.04,'completed','2025-05-05 17:01:00'),(119,8,'Inversiones Agrícolas SAPM',4242,678.72,4920.72,'completed','2025-05-08 17:17:00'),(120,8,'Finca Los Cedros',6752,1080.32,7832.32,'completed','2025-05-09 14:21:00'),(121,8,'Cooperativa Agrícola del Valle',2628,420.48,3048.48,'completed','2025-05-24 14:06:00'),(122,8,'Inversiones Agrícolas SAPM',3471.5,555.44,4026.94,'completed','2025-05-28 16:07:00'),(123,8,'Cooperativa Agrícola del Valle',2160,345.6,2505.6,'completed','2025-06-02 11:55:00'),(124,8,'Agropecuaria del Bajío',6246,999.36,7245.36,'completed','2025-06-03 13:10:00'),(125,8,'Agropecuaria del Bajío',5912,945.92,6857.92,'completed','2025-06-07 09:38:00'),(126,8,'Agropecuaria del Bajío',3222,515.52,3737.52,'completed','2025-06-08 16:14:00'),(127,8,'Productores Unidos de Jalisco',8529,1364.64,9893.64,'completed','2025-06-10 09:13:00'),(128,8,'Inversiones Agrícolas SAPM',4888,782.08,5670.08,'completed','2025-06-19 10:16:00'),(129,8,'Rancho Las Palmas',9960,1593.6,11553.6,'completed','2025-06-22 12:47:00'),(130,8,'Agroindustrias del Norte',1050,168,1218,'completed','2025-06-23 16:31:00'),(131,8,'Cooperativa Tierra Fértil',8868,1418.88,10286.9,'completed','2025-07-05 09:24:00'),(132,8,'Rancho El Porvenir',2623.5,419.76,3043.26,'completed','2025-07-06 09:43:00'),(133,8,'Inversiones Agrícolas SAPM',9433,1509.28,10942.3,'completed','2025-07-14 08:46:00'),(134,8,'Agropecuaria del Bajío',2964,474.24,3438.24,'completed','2025-07-21 16:38:00'),(135,8,'Agroindustrias del Norte',6811.5,1089.84,7901.34,'completed','2025-07-22 16:49:00'),(136,8,'Productores Unidos de Jalisco',8625,1380,10005,'completed','2025-07-26 11:03:00'),(137,8,'Agroindustrias del Norte',4840,774.4,5614.4,'completed','2025-08-03 10:42:00'),(138,8,'Granja Santa Rosa',2674.5,427.92,3102.42,'completed','2025-08-16 11:59:00'),(139,8,'Agropecuaria del Bajío',7581,1212.96,8793.96,'completed','2025-08-18 13:28:00'),(140,8,'Hacienda San Marcos',3094,495.04,3589.04,'completed','2025-08-24 17:14:00'),(141,8,'Rancho El Porvenir',1026,164.16,1190.16,'completed','2025-08-25 11:04:00'),(142,8,'Hacienda San Marcos',8553,1368.48,9921.48,'completed','2025-08-27 12:42:00'),(143,8,'Ejido La Esperanza',6862.5,1098,7960.5,'completed','2025-09-04 14:26:00'),(144,8,'Agropecuaria del Bajío',8895,1423.2,10318.2,'completed','2025-09-07 09:03:00'),(145,8,'Hacienda San Marcos',3800,608,4408,'completed','2025-09-08 11:34:00'),(146,8,'Cooperativa Agrícola del Valle',14298,2287.68,16585.7,'completed','2025-09-14 15:51:00'),(147,8,'Hacienda San Marcos',6008,961.28,6969.28,'completed','2025-09-16 10:26:00'),(148,8,'Agroindustrias del Norte',7182,1149.12,8331.12,'completed','2025-09-19 14:00:00'),(149,8,'Granja Santa Rosa',9934,1589.44,11523.4,'completed','2025-09-23 16:42:00'),(150,8,'Rancho Las Palmas',4738,758.08,5496.08,'completed','2025-09-25 08:47:00'),(151,8,'Rancho Las Palmas',6956.5,1113.04,8069.54,'completed','2025-09-26 10:03:00'),(152,8,'Granja Santa Rosa',1780,284.8,2064.8,'completed','2025-09-29 09:56:00'),(153,8,'Granja Santa Rosa',5500,880,6380,'completed','2025-10-07 10:42:00'),(154,8,'Rancho El Porvenir',3899,623.84,4522.84,'completed','2025-10-08 15:39:00'),(155,8,'Ejido La Esperanza',2976,476.16,3452.16,'completed','2025-10-09 09:56:00'),(156,8,'Inversiones Agrícolas SAPM',4090.5,654.48,4744.98,'completed','2025-10-11 16:45:00'),(157,8,'Agroindustrias del Norte',846,135.36,981.36,'completed','2025-10-17 12:07:00'),(158,8,'Cooperativa Tierra Fértil',4905,784.8,5689.8,'completed','2025-10-19 11:45:00'),(159,8,'Rancho El Porvenir',3524.5,563.92,4088.42,'completed','2025-10-22 09:40:00'),(160,8,'Agropecuaria del Bajío',5602.5,896.4,6498.9,'completed','2025-10-23 12:10:00'),(161,8,'Finca Los Cedros',4836,773.76,5609.76,'completed','2025-10-28 10:34:00'),(162,8,'Agroindustrias del Norte',1624,259.84,1883.84,'completed','2025-10-29 14:08:00'),(163,8,'Cooperativa Agrícola del Valle',11060.5,1769.68,12830.2,'completed','2025-11-07 13:49:00'),(164,8,'Hacienda San Marcos',2562,409.92,2971.92,'completed','2025-11-08 10:51:00'),(165,8,'Agroindustrias del Norte',8329,1332.64,9661.64,'completed','2025-11-12 13:50:00'),(166,8,'Productores Unidos de Jalisco',4142,662.72,4804.72,'completed','2025-11-22 10:50:00'),(167,8,'Inversiones Agrícolas SAPM',1144,183.04,1327.04,'completed','2025-11-27 13:19:00'),(168,8,'Hacienda San Marcos',3649.5,583.92,4233.42,'completed','2025-11-29 14:21:00'),(169,8,'Productores Unidos de Jalisco',9863,1578.08,11441.1,'completed','2025-12-01 08:06:00'),(170,8,'Cooperativa Agrícola del Valle',5758.5,921.36,6679.86,'completed','2025-12-04 14:57:00'),(171,8,'Rancho Las Palmas',4791,766.56,5557.56,'completed','2025-12-06 11:23:00'),(172,8,'Agropecuaria del Bajío',7408,1185.28,8593.28,'completed','2025-12-09 09:46:00'),(173,8,'Finca Los Cedros',1116,178.56,1294.56,'completed','2025-12-11 12:35:00'),(174,8,'Granja Santa Rosa',7706,1232.96,8938.96,'completed','2025-12-13 10:39:00'),(175,8,'Cooperativa Tierra Fértil',1600,256,1856,'completed','2025-12-18 17:41:00'),(176,8,'Hacienda San Marcos',6961,1113.76,8074.76,'completed','2025-12-19 16:30:00'),(177,8,'Cooperativa Agrícola del Valle',2025,324,2349,'completed','2025-12-22 11:43:00'),(178,8,'Inversiones Agrícolas SAPM',1525,244,1769,'completed','2025-12-27 17:54:00'),(179,8,'Cooperativa Agrícola del Valle',4092,654.72,4746.72,'completed','2026-01-01 14:14:00'),(180,8,'Rancho Las Palmas',825,132,957,'completed','2026-01-05 11:58:00'),(181,8,'Inversiones Agrícolas SAPM',6911.5,1105.84,8017.34,'completed','2026-01-07 16:35:00'),(182,8,'Rancho Las Palmas',4030,644.8,4674.8,'completed','2026-01-08 15:57:00'),(183,8,'Hacienda San Marcos',5665,906.4,6571.4,'completed','2026-01-13 12:49:00'),(184,8,'Productores Unidos de Jalisco',6090,974.4,7064.4,'completed','2026-01-16 13:20:00'),(185,8,'Finca Los Cedros',3648,583.68,4231.68,'completed','2026-01-21 11:04:00'),(186,8,'Hacienda San Marcos',11738,1878.08,13616.1,'completed','2026-01-23 14:24:00'),(187,8,'Granja Santa Rosa',9196.5,1471.44,10667.9,'completed','2026-01-28 14:34:00'),(188,8,'Granja Santa Rosa',8936,1429.76,10365.8,'completed','2026-01-30 13:42:00'),(189,8,'Inversiones Agrícolas SAPM',3574,571.84,4145.84,'completed','2026-02-01 10:03:00'),(190,8,'Granja Santa Rosa',4436,709.76,5145.76,'completed','2026-02-03 12:48:00'),(191,8,'Rancho El Porvenir',6612.5,1058,7670.5,'completed','2026-02-05 13:14:00'),(192,8,'Rancho El Porvenir',2278,364.48,2642.48,'completed','2026-02-13 17:09:00'),(193,8,'Cooperativa Agrícola del Valle',4740,758.4,5498.4,'completed','2026-02-14 17:13:00'),(194,8,'Cooperativa Tierra Fértil',1395,223.2,1618.2,'completed','2026-02-19 09:49:00'),(195,8,'Rancho El Porvenir',4478,716.48,5194.48,'completed','2026-02-21 12:36:00'),(196,8,'Agropecuaria del Bajío',12270,1963.2,14233.2,'completed','2026-02-22 11:06:00'),(197,8,'Rancho El Porvenir',3756.5,601.04,4357.54,'completed','2026-02-26 13:34:00'),(198,8,'Rancho El Porvenir',6044,967.04,7011.04,'completed','2026-02-28 14:52:00'),(199,8,'Rancho Las Palmas',4332,693.12,5025.12,'completed','2026-03-05 15:29:00'),(200,8,'Hacienda San Marcos',5011.5,801.84,5813.34,'completed','2026-03-06 09:17:00'),(201,8,'Granja Santa Rosa',2334,373.44,2707.44,'completed','2026-03-09 13:01:00'),(202,8,'Productores Unidos de Jalisco',8280,1324.8,9604.8,'completed','2026-03-14 13:17:00'),(203,8,'Finca Los Cedros',10933,1749.28,12682.3,'completed','2026-03-17 14:31:00'),(204,8,'Rancho El Porvenir',4005,640.8,4645.8,'completed','2026-03-20 09:18:00'),(205,8,'Productores Unidos de Jalisco',4830,772.8,5602.8,'completed','2026-03-21 17:23:00'),(206,8,'Rancho Las Palmas',4076,652.16,4728.16,'completed','2026-03-23 13:22:00'),(207,8,'Cooperativa Agrícola del Valle',4888,782.08,5670.08,'completed','2026-03-24 16:48:00'),(208,8,'Productores Unidos de Jalisco',1092,174.72,1266.72,'completed','2026-04-04 11:23:00'),(209,8,'Rancho Las Palmas',2137.5,342,2479.5,'completed','2026-04-07 10:17:00'),(210,8,'Finca Los Cedros',2614.5,418.32,3032.82,'completed','2026-04-10 10:40:00'),(211,8,'Inversiones Agrícolas SAPM',1282.5,205.2,1487.7,'completed','2026-04-17 15:21:00'),(212,8,'Inversiones Agrícolas SAPM',1242,198.72,1440.72,'completed','2026-04-19 09:52:00'),(213,8,'Cooperativa Tierra Fértil',1482,237.12,1719.12,'completed','2026-04-20 08:09:00'),(214,8,'Productores Unidos de Jalisco',2784,445.44,3229.44,'completed','2026-04-24 09:15:00'),(215,8,'Cooperativa Tierra Fértil',6036.5,965.84,7002.34,'completed','2026-04-25 17:50:00'),(216,8,'Agropecuaria del Bajío',2550,408,2958,'completed','2026-05-01 09:10:00'),(217,8,'Agroindustrias del Norte',3031.5,485.04,3516.54,'completed','2026-05-02 08:26:00'),(218,8,'Productores Unidos de Jalisco',2122.5,339.6,2462.1,'completed','2026-05-03 12:44:00'),(219,8,'Agropecuaria del Bajío',1395,223.2,1618.2,'completed','2026-05-05 17:42:00'),(220,8,'Hacienda San Marcos',3705.5,592.88,4298.38,'completed','2026-05-06 10:58:00'),(221,8,'Cooperativa Tierra Fértil',4715,754.4,5469.4,'completed','2026-05-07 17:58:00'),(222,8,'Granja Santa Rosa',10595.5,1695.28,12290.8,'completed','2026-05-08 12:32:00'),(223,8,'Cooperativa Tierra Fértil',6032,965.12,6997.12,'completed','2026-05-10 12:01:00'),(224,8,'Cooperativa Tierra Fértil',9400,1504,10904,'completed','2026-05-11 17:01:00'),(225,8,'Inversiones Agrícolas SAPM',12608,2017.28,14625.3,'completed','2026-05-13 12:11:00');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('warehouse','sales','executive') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT (now()),
  `updated_at` datetime DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `ix_users_employee_id` (`employee_id`),
  KEY `ix_users_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (7,'ALM001','Carlos Mendoza','carlos@bodeflux.com','$2b$12$r1/sCUxIkqrLhPkNEK1LBehEb2KOk3M/H0wRGzzPLgsw/jYESXXA.','warehouse',1,'2026-05-14 15:54:09','2026-05-14 15:54:09'),(8,'VEN001','María García','maria@bodeflux.com','$2b$12$xLIDhr9QIdrRXiif.lPtxujarCVrgtDEpVr32cJRXARxqfFIhUwHC','sales',1,'2026-05-14 15:54:09','2026-05-14 15:54:09'),(9,'EJE001','Roberto López','roberto@bodeflux.com','$2b$12$m6qBQ295DbKvXfs0Qe0vuuWwbwpDP.K12u4cLV5reLWllPXUAdMAe','executive',1,'2026-05-14 15:54:09','2026-05-14 15:54:09');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

--
-- Table structure for table `waste_records`
--

DROP TABLE IF EXISTS `waste_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `waste_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inventory_item_id` int DEFAULT NULL,
  `lot_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` float NOT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `has_evidence` tinyint(1) DEFAULT NULL,
  `notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `waste_date` date NOT NULL,
  `created_at` datetime DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `inventory_item_id` (`inventory_item_id`),
  KEY `ix_waste_records_id` (`id`),
  CONSTRAINT `waste_records_ibfk_1` FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `waste_records`
--

/*!40000 ALTER TABLE `waste_records` DISABLE KEYS */;
INSERT INTO `waste_records` VALUES (51,NULL,'WASTE-2025-05-001','Semilla Dañada',3.3,'bolsa','humedad',1,'Merma detectada en revisión mensual de 5/2025','2025-05-28','2026-05-14 15:54:09'),(52,NULL,'WASTE-2025-05-002','NPK Apelmazado',10.3,'kg','humedad',1,'Merma detectada en revisión mensual de 5/2025','2025-05-10','2026-05-14 15:54:09'),(53,NULL,'WASTE-2025-05-003','Fertilizante Vencido',2.2,'kg','vencimiento',1,'Merma detectada en revisión mensual de 5/2025','2025-05-15','2026-05-14 15:54:09'),(54,NULL,'WASTE-2025-05-004','Fungicida Contaminado',14.6,'L','contaminación',1,'Merma detectada en revisión mensual de 5/2025','2025-05-04','2026-05-14 15:54:09'),(55,NULL,'WASTE-2025-06-005','NPK Apelmazado',1.8,'kg','humedad',0,'Merma detectada en revisión mensual de 6/2025','2025-06-14','2026-05-14 15:54:09'),(56,NULL,'WASTE-2025-06-006','Fungicida Contaminado',11.6,'L','contaminación',0,'Merma detectada en revisión mensual de 6/2025','2025-06-20','2026-05-14 15:54:09'),(57,NULL,'WASTE-2025-07-007','Fertilizante Vencido',4.7,'kg','vencimiento',1,'Merma detectada en revisión mensual de 7/2025','2025-07-07','2026-05-14 15:54:09'),(58,NULL,'WASTE-2025-07-008','Urea Apelmazada',13.3,'kg','humedad',1,'Merma detectada en revisión mensual de 7/2025','2025-07-15','2026-05-14 15:54:09'),(59,NULL,'WASTE-2025-07-009','Semilla Dañada',14.6,'bolsa','humedad',0,'Merma detectada en revisión mensual de 7/2025','2025-07-01','2026-05-14 15:54:09'),(60,NULL,'WASTE-2025-07-010','Herbicida Caducado',3.2,'L','vencimiento',0,'Merma detectada en revisión mensual de 7/2025','2025-07-23','2026-05-14 15:54:09'),(61,NULL,'WASTE-2025-07-011','Fertilizante Vencido',6.7,'kg','vencimiento',1,'Merma detectada en revisión mensual de 7/2025','2025-07-18','2026-05-14 15:54:09'),(62,NULL,'WASTE-2025-08-012','NPK Apelmazado',2.6,'kg','humedad',1,'Merma detectada en revisión mensual de 8/2025','2025-08-31','2026-05-14 15:54:09'),(63,NULL,'WASTE-2025-08-013','NPK Apelmazado',11,'kg','humedad',0,'Merma detectada en revisión mensual de 8/2025','2025-08-30','2026-05-14 15:54:09'),(64,NULL,'WASTE-2025-09-014','Semilla de Trigo',7.8,'kg','plaga',1,'Merma detectada en revisión mensual de 9/2025','2025-09-27','2026-05-14 15:54:09'),(65,NULL,'WASTE-2025-09-015','Herbicida Caducado',8.7,'L','vencimiento',1,'Merma detectada en revisión mensual de 9/2025','2025-09-15','2026-05-14 15:54:09'),(66,NULL,'WASTE-2025-09-016','Herbicida Caducado',9.4,'L','vencimiento',0,'Merma detectada en revisión mensual de 9/2025','2025-09-30','2026-05-14 15:54:09'),(67,NULL,'WASTE-2025-09-017','Insecticida Deteriorado',2,'L','daño físico',1,'Merma detectada en revisión mensual de 9/2025','2025-09-28','2026-05-14 15:54:09'),(68,NULL,'WASTE-2025-10-018','Urea Apelmazada',1,'kg','humedad',0,'Merma detectada en revisión mensual de 10/2025','2025-10-27','2026-05-14 15:54:09'),(69,NULL,'WASTE-2025-10-019','Urea Apelmazada',9.2,'kg','humedad',0,'Merma detectada en revisión mensual de 10/2025','2025-10-27','2026-05-14 15:54:09'),(70,NULL,'WASTE-2025-10-020','NPK Apelmazado',3.1,'kg','humedad',0,'Merma detectada en revisión mensual de 10/2025','2025-10-28','2026-05-14 15:54:09'),(71,NULL,'WASTE-2025-10-021','NPK Apelmazado',5.7,'kg','humedad',0,'Merma detectada en revisión mensual de 10/2025','2025-10-12','2026-05-14 15:54:09'),(72,NULL,'WASTE-2025-11-022','NPK Apelmazado',5.5,'kg','humedad',1,'Merma detectada en revisión mensual de 11/2025','2025-11-30','2026-05-14 15:54:09'),(73,NULL,'WASTE-2025-11-023','Herbicida Caducado',6.4,'L','vencimiento',1,'Merma detectada en revisión mensual de 11/2025','2025-11-19','2026-05-14 15:54:09'),(74,NULL,'WASTE-2025-11-024','Fertilizante Vencido',11.4,'kg','vencimiento',0,'Merma detectada en revisión mensual de 11/2025','2025-11-11','2026-05-14 15:54:09'),(75,NULL,'WASTE-2025-11-025','Semilla de Trigo',14.8,'kg','plaga',0,'Merma detectada en revisión mensual de 11/2025','2025-11-13','2026-05-14 15:54:09'),(76,NULL,'WASTE-2025-11-026','Insecticida Deteriorado',14.5,'L','daño físico',1,'Merma detectada en revisión mensual de 11/2025','2025-11-16','2026-05-14 15:54:09'),(77,NULL,'WASTE-2025-12-027','Semilla Dañada',12.8,'bolsa','humedad',1,'Merma detectada en revisión mensual de 12/2025','2025-12-28','2026-05-14 15:54:09'),(78,NULL,'WASTE-2025-12-028','NPK Apelmazado',11.1,'kg','humedad',1,'Merma detectada en revisión mensual de 12/2025','2025-12-01','2026-05-14 15:54:09'),(79,NULL,'WASTE-2025-12-029','Insecticida Deteriorado',7.6,'L','daño físico',1,'Merma detectada en revisión mensual de 12/2025','2025-12-03','2026-05-14 15:54:09'),(80,NULL,'WASTE-2025-12-030','Fungicida Contaminado',10.7,'L','contaminación',0,'Merma detectada en revisión mensual de 12/2025','2025-12-20','2026-05-14 15:54:09'),(81,NULL,'WASTE-2026-01-031','Fungicida Contaminado',10.4,'L','contaminación',0,'Merma detectada en revisión mensual de 1/2026','2026-01-28','2026-05-14 15:54:09'),(82,NULL,'WASTE-2026-01-032','Semilla de Trigo',5.4,'kg','plaga',0,'Merma detectada en revisión mensual de 1/2026','2026-01-31','2026-05-14 15:54:09'),(83,NULL,'WASTE-2026-02-033','Fertilizante Vencido',2,'kg','vencimiento',0,'Merma detectada en revisión mensual de 2/2026','2026-02-20','2026-05-14 15:54:09'),(84,NULL,'WASTE-2026-02-034','Urea Apelmazada',11.5,'kg','humedad',1,'Merma detectada en revisión mensual de 2/2026','2026-02-08','2026-05-14 15:54:09'),(85,NULL,'WASTE-2026-02-035','Semilla Dañada',9.9,'bolsa','humedad',1,'Merma detectada en revisión mensual de 2/2026','2026-02-25','2026-05-14 15:54:09'),(86,NULL,'WASTE-2026-02-036','NPK Apelmazado',10.7,'kg','humedad',1,'Merma detectada en revisión mensual de 2/2026','2026-02-06','2026-05-14 15:54:09'),(87,NULL,'WASTE-2026-02-037','Fertilizante Vencido',12.1,'kg','vencimiento',1,'Merma detectada en revisión mensual de 2/2026','2026-02-11','2026-05-14 15:54:09'),(88,NULL,'WASTE-2026-03-038','Fungicida Contaminado',3,'L','contaminación',0,'Merma detectada en revisión mensual de 3/2026','2026-03-14','2026-05-14 15:54:09'),(89,NULL,'WASTE-2026-03-039','Semilla de Trigo',10.5,'kg','plaga',1,'Merma detectada en revisión mensual de 3/2026','2026-03-19','2026-05-14 15:54:09'),(90,NULL,'WASTE-2026-03-040','Insecticida Deteriorado',2.1,'L','daño físico',1,'Merma detectada en revisión mensual de 3/2026','2026-03-06','2026-05-14 15:54:09'),(91,NULL,'WASTE-2026-03-041','Herbicida Caducado',13.8,'L','vencimiento',1,'Merma detectada en revisión mensual de 3/2026','2026-03-16','2026-05-14 15:54:09'),(92,NULL,'WASTE-2026-04-042','NPK Apelmazado',4.6,'kg','humedad',1,'Merma detectada en revisión mensual de 4/2026','2026-04-21','2026-05-14 15:54:09'),(93,NULL,'WASTE-2026-04-043','Fertilizante Vencido',12.3,'kg','vencimiento',1,'Merma detectada en revisión mensual de 4/2026','2026-04-29','2026-05-14 15:54:09'),(94,NULL,'WASTE-2026-04-044','Insecticida Deteriorado',7.2,'L','daño físico',1,'Merma detectada en revisión mensual de 4/2026','2026-04-03','2026-05-14 15:54:09'),(95,NULL,'WASTE-2026-05-045','Semilla de Trigo',4.5,'kg','plaga',1,'Merma detectada en revisión mensual de 5/2026','2026-05-12','2026-05-14 15:54:09'),(96,NULL,'WASTE-2026-05-046','Herbicida Caducado',12.9,'L','vencimiento',1,'Merma detectada en revisión mensual de 5/2026','2026-05-07','2026-05-14 15:54:09'),(97,NULL,'WASTE-2026-05-047','Herbicida Caducado',9,'L','vencimiento',0,'Merma detectada en revisión mensual de 5/2026','2026-05-07','2026-05-14 15:54:09');
/*!40000 ALTER TABLE `waste_records` ENABLE KEYS */;

--
-- Dumping events for database 'agrostack'
--

--
-- Dumping routines for database 'agrostack'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-14 16:08:07
