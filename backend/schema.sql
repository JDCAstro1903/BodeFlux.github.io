-- ============================================
-- AgroStack Database Schema
-- MySQL 9.0+ / utf8mb4
-- ============================================

CREATE DATABASE IF NOT EXISTS agrostack
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE agrostack;

-- ============================================
-- USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50)  NOT NULL UNIQUE,
    name        VARCHAR(150) NOT NULL,
    email       VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role        ENUM('warehouse','sales','executive') NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employee_id (employee_id)
) ENGINE=InnoDB;

-- ============================================
-- PROVIDERS
-- ============================================
CREATE TABLE IF NOT EXISTS providers (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(200) NOT NULL,
    contact    VARCHAR(150) NOT NULL,
    email      VARCHAR(200) NOT NULL,
    phone      VARCHAR(50)  NOT NULL,
    address    VARCHAR(300) NOT NULL,
    category   VARCHAR(100) NOT NULL,
    rating     FLOAT DEFAULT 0.0,
    status     ENUM('active','inactive') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- PRODUCTS (catálogo de ventas)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    category    VARCHAR(100) NOT NULL,
    stock       FLOAT DEFAULT 0,
    price       FLOAT NOT NULL,
    unit        VARCHAR(50) NOT NULL,
    status      ENUM('available','low','out') DEFAULT 'available',
    image_emoji VARCHAR(10) DEFAULT '📦',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- PRODUCT PRESENTATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS product_presentations (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    product_id        INT NOT NULL,
    presentation_name VARCHAR(100) NOT NULL,
    content_value     FLOAT NOT NULL,
    content_unit      VARCHAR(50) NOT NULL,
    price_override    FLOAT DEFAULT NULL,
    barcode           VARCHAR(100) DEFAULT NULL,
    is_default        BOOLEAN DEFAULT FALSE,
    is_active         BOOLEAN DEFAULT TRUE,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
) ENGINE=InnoDB;

-- ============================================
-- WAREHOUSE LOCATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS warehouse_locations (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    code         VARCHAR(10) NOT NULL UNIQUE,
    row_label    CHAR(1) NOT NULL,
    col_number   INT NOT NULL,
    max_capacity FLOAT NOT NULL DEFAULT 100,
    capacity_unit VARCHAR(20) NOT NULL DEFAULT 'unidades',
    location_type ENUM('rack','piso','refrigerado','exterior') DEFAULT 'rack',
    is_enabled   BOOLEAN DEFAULT TRUE,
    notes        VARCHAR(200),
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code)
) ENGINE=InnoDB;

-- ============================================
-- INVENTORY ITEMS (entradas al almacén)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_items (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    product_name  VARCHAR(200) NOT NULL,
    category      VARCHAR(100) NOT NULL,
    quantity      FLOAT NOT NULL,
    unit          VARCHAR(50)  NOT NULL,
    lot_number    VARCHAR(100) NOT NULL,
    expiry_date   DATE NOT NULL,
    location      VARCHAR(100) NOT NULL,
    provider      VARCHAR(200),
    provider_id   INT,
    receipt_date  DATE NOT NULL,
    status        ENUM('active','output','waste') DEFAULT 'active',
    registered_by_id INT,
    registered_by_name VARCHAR(150),
    presentation_id INT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_lot (lot_number),
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL,
    FOREIGN KEY (registered_by_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (presentation_id) REFERENCES product_presentations(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- INVENTORY MOVEMENTS (log de entradas/salidas/mermas)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_movements (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    inventory_item_id INT NOT NULL,
    movement_type     ENUM('entry','output','waste') NOT NULL,
    quantity          FLOAT NOT NULL,
    user_id           INT,
    destination       VARCHAR(200),
    notes             VARCHAR(500),
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- SALES
-- ============================================
CREATE TABLE IF NOT EXISTS sales (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT,
    customer_name VARCHAR(200),
    subtotal      FLOAT NOT NULL,
    discount_type ENUM('percentage','fixed') DEFAULT NULL,
    discount_value FLOAT DEFAULT 0.0,
    discount_amount FLOAT DEFAULT 0.0,
    tax           FLOAT NOT NULL DEFAULT 0.0,
    total         FLOAT NOT NULL,
    status        ENUM('pending','completed','cancelled') DEFAULT 'completed',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- SALE ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS sale_items (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    sale_id      INT NOT NULL,
    product_id   INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity     FLOAT NOT NULL,
    original_price FLOAT NOT NULL,
    discount_type ENUM('percentage','fixed') DEFAULT NULL,
    discount_value FLOAT DEFAULT 0.0,
    unit_price   FLOAT NOT NULL,
    total_price  FLOAT NOT NULL,
    FOREIGN KEY (sale_id)    REFERENCES sales(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- WASTE RECORDS (mermas)
-- ============================================
CREATE TABLE IF NOT EXISTS waste_records (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    inventory_item_id INT,
    lot_number        VARCHAR(100) NOT NULL,
    product_name      VARCHAR(200) NOT NULL,
    quantity          FLOAT NOT NULL,
    unit              VARCHAR(50) NOT NULL,
    reason            VARCHAR(100) NOT NULL,
    has_evidence      BOOLEAN DEFAULT FALSE,
    notes             VARCHAR(500),
    waste_date        DATE NOT NULL,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE SET NULL
) ENGINE=InnoDB;
