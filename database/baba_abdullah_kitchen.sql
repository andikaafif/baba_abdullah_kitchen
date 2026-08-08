-- ============================================================
-- Baba Abdullah Kitchen — MySQL Database Schema
-- Compatible with phpMyAdmin / MySQL 5.7+
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+07:00";

CREATE DATABASE IF NOT EXISTS `baba_abdullah_kitchen`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `baba_abdullah_kitchen`;

-- ------------------------------------------------------------
-- Table: categories
-- ------------------------------------------------------------
CREATE TABLE `categories` (
  `id`         INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100)     NOT NULL,
  `slug`       VARCHAR(100)     NOT NULL,
  `created_at` TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: products
-- ------------------------------------------------------------
CREATE TABLE `products` (
  `id`          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(200)     NOT NULL,
  `photo_url`   VARCHAR(500)              DEFAULT NULL,
  `category_id` INT UNSIGNED     NOT NULL,
  `description` TEXT                      DEFAULT NULL,
  `is_active`   TINYINT(1)       NOT NULL DEFAULT 1,
  `created_at`  TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_products_category` (`category_id`),
  CONSTRAINT `fk_products_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: product_variants
-- ------------------------------------------------------------
CREATE TABLE `product_variants` (
  `id`         INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `product_id` INT UNSIGNED     NOT NULL,
  `label`      VARCHAR(100)     NOT NULL,
  `pcs`        VARCHAR(50)      NOT NULL,
  `price`      DECIMAL(12,2)    NOT NULL DEFAULT 0.00,
  `cost_price` DECIMAL(12,2)    NOT NULL DEFAULT 0.00 COMMENT 'HPP / cost price for profit calculation',
  `stock`      INT              NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_variants_product` (`product_id`),
  CONSTRAINT `fk_variants_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: orders
-- ------------------------------------------------------------
CREATE TABLE `orders` (
  `id`               INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `order_number`     VARCHAR(50)      NOT NULL,
  `customer_name`    VARCHAR(200)     NOT NULL,
  `customer_phone`   VARCHAR(30)               DEFAULT NULL,
  `customer_address` TEXT                       DEFAULT NULL,
  `delivery_method`  ENUM('Pickup','Delivery') NOT NULL DEFAULT 'Pickup',
  `payment_method`   ENUM('Cash','Transfer','QRIS') NOT NULL DEFAULT 'Cash',
  `total_price`      DECIMAL(14,2)    NOT NULL DEFAULT 0.00,
  `profit`           DECIMAL(14,2)    NOT NULL DEFAULT 0.00,
  `status`           ENUM('pending','confirmed','preparing','ready','delivered','cancelled')
                                      NOT NULL DEFAULT 'pending',
  `notes`            TEXT                       DEFAULT NULL,
  `created_at`       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_orders_number` (`order_number`),
  KEY `idx_orders_created_at` (`created_at`),
  KEY `idx_orders_status`     (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: order_items
-- ------------------------------------------------------------
CREATE TABLE `order_items` (
  `id`                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `order_id`            INT UNSIGNED  NOT NULL,
  `product_variant_id`  INT UNSIGNED           DEFAULT NULL,
  `product_name`        VARCHAR(200)  NOT NULL,
  `variant_label`       VARCHAR(100)  NOT NULL,
  `quantity`            INT UNSIGNED  NOT NULL DEFAULT 1,
  `unit_price`          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `unit_cost`           DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `subtotal`            DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `fk_items_order`   (`order_id`),
  KEY `fk_items_variant` (`product_variant_id`),
  CONSTRAINT `fk_items_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_items_variant`
    FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: promotions
-- ------------------------------------------------------------
CREATE TABLE `promotions` (
  `id`             INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `name`           VARCHAR(200)     NOT NULL,
  `description`    TEXT                       DEFAULT NULL,
  `discount_type`  ENUM('percent','fixed')    NOT NULL DEFAULT 'percent',
  `discount_value` DECIMAL(10,2)    NOT NULL DEFAULT 0.00,
  `start_date`     DATE                       NOT NULL,
  `end_date`       DATE                       NOT NULL,
  `is_active`      TINYINT(1)       NOT NULL DEFAULT 1,
  `created_at`     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_promotions_dates` (`start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: promotion_products  (pivot)
-- ------------------------------------------------------------
CREATE TABLE `promotion_products` (
  `promotion_id` INT UNSIGNED NOT NULL,
  `product_id`   INT UNSIGNED NOT NULL,
  PRIMARY KEY (`promotion_id`, `product_id`),
  KEY `fk_pp_product` (`product_id`),
  CONSTRAINT `fk_pp_promotion`
    FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pp_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: inventory_logs
-- ------------------------------------------------------------
CREATE TABLE `inventory_logs` (
  `id`                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `product_variant_id`  INT UNSIGNED  NOT NULL,
  `change_qty`          INT           NOT NULL COMMENT 'positive=restock, negative=sale/adjustment',
  `reason`              VARCHAR(255)           DEFAULT NULL,
  `created_at`          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_invlog_variant` (`product_variant_id`),
  CONSTRAINT `fk_invlog_variant`
    FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: admin_users
-- ------------------------------------------------------------
CREATE TABLE `admin_users` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username`   VARCHAR(100) NOT NULL,
  `password`   VARCHAR(255) NOT NULL COMMENT 'bcrypt hash',
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW `v_daily_sales` AS
SELECT
  DATE(`created_at`)      AS `sale_date`,
  COUNT(*)                AS `order_count`,
  SUM(`total_price`)      AS `total_revenue`,
  SUM(`profit`)           AS `total_profit`
FROM `orders`
WHERE `status` NOT IN ('cancelled')
GROUP BY DATE(`created_at`);

CREATE OR REPLACE VIEW `v_weekly_sales` AS
SELECT
  YEARWEEK(`created_at`, 1)  AS `year_week`,
  MIN(DATE(`created_at`))    AS `week_start`,
  COUNT(*)                   AS `order_count`,
  SUM(`total_price`)         AS `total_revenue`,
  SUM(`profit`)              AS `total_profit`
FROM `orders`
WHERE `status` NOT IN ('cancelled')
GROUP BY YEARWEEK(`created_at`, 1);

CREATE OR REPLACE VIEW `v_monthly_sales` AS
SELECT
  DATE_FORMAT(`created_at`, '%Y-%m')  AS `year_month`,
  COUNT(*)                            AS `order_count`,
  SUM(`total_price`)                  AS `total_revenue`,
  SUM(`profit`)                       AS `total_profit`
FROM `orders`
WHERE `status` NOT IN ('cancelled')
GROUP BY DATE_FORMAT(`created_at`, '%Y-%m');

CREATE OR REPLACE VIEW `v_top_variants` AS
SELECT
  pv.`id`          AS `variant_id`,
  p.`name`         AS `product_name`,
  c.`name`         AS `category_name`,
  pv.`label`       AS `variant_label`,
  pv.`pcs`         AS `pcs`,
  SUM(oi.`quantity`)   AS `total_sold`,
  SUM(oi.`subtotal`)   AS `total_revenue`
FROM `order_items` oi
JOIN `product_variants` pv ON pv.`id` = oi.`product_variant_id`
JOIN `products`          p  ON p.`id`  = pv.`product_id`
JOIN `categories`        c  ON c.`id`  = p.`category_id`
JOIN `orders`            o  ON o.`id`  = oi.`order_id`
WHERE o.`status` NOT IN ('cancelled')
GROUP BY pv.`id`, p.`name`, c.`name`, pv.`label`, pv.`pcs`
ORDER BY `total_sold` DESC;

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Categories
INSERT INTO `categories` (`name`, `slug`) VALUES
  ('Kukus',  'kukus'),
  ('Mentai', 'mentai'),
  ('Cheese', 'cheese'),
  ('Frozen', 'frozen');

-- Products
INSERT INTO `products` (`name`, `photo_url`, `category_id`, `description`) VALUES
  ('Kukus Original', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop', 1,
   'Dimsum kukus original dengan isian daging pilihan yang lembut dan gurih. Dibuat dari bahan-bahan segar pilihan tanpa MSG.'),
  ('Mentai Regular', 'https://images.unsplash.com/photo-1582482067920-f30e1f5ea75c?w=400&h=300&fit=crop', 2,
   'Dimsum dengan saus mentai creamy yang kaya rasa, dibakar sempurna hingga kecoklatan.'),
  ('Mentai Mix Original', 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&h=300&fit=crop', 2,
   'Perpaduan sempurna dimsum original dengan topping mentai yang creamy dan lezat.'),
  ('Cheese Cheddar', 'https://images.unsplash.com/photo-1571805529673-0f56b922b359?w=400&h=300&fit=crop', 3,
   'Dimsum dengan lelehan keju cheddar premium yang gurih dan creamy di setiap gigitannya.'),
  ('Cheese Cheddar Mix Mentai', 'https://images.unsplash.com/photo-1615361200141-f45040f367be?w=400&h=300&fit=crop', 3,
   'Kombinasi istimewa keju cheddar dan mentai yang menciptakan cita rasa premium yang tak tertandingi.'),
  ('Frozen', 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=300&fit=crop', 4,
   'Dimsum beku siap masak untuk stok di rumah. Praktis dan tetap lezat kapan saja.');

-- Product Variants (price, cost_price, stock)
INSERT INTO `product_variants` (`product_id`, `label`, `pcs`, `price`, `cost_price`, `stock`) VALUES
  -- Kukus Original (id=1)
  (1, 'Small',       '5 pcs',  25000, 12000, 50),
  (1, 'Regular',     '6 pcs',  28000, 14000, 50),
  (1, 'Medium',      '10 pcs', 43000, 22000, 30),
  (1, 'Family Pack', '12 pcs', 58000, 28000, 20),
  -- Mentai Regular (id=2)
  (2, 'Medium',      '6 pcs',  34000, 17000, 40),
  (2, 'Family Pack', '12 pcs', 60000, 30000, 20),
  -- Mentai Mix Original (id=3)
  (3, 'Medium',      '6 pcs',  45000, 22000, 30),
  (3, 'Family Pack', '12 pcs', 58000, 28000, 20),
  -- Cheese Cheddar (id=4)
  (4, 'Small',       '4 pcs',  31000, 15000, 40),
  (4, 'Medium',      '6 pcs',  40000, 20000, 30),
  (4, 'Family Pack', '12 pcs', 63000, 31000, 20),
  -- Cheese Cheddar Mix Mentai (id=5)
  (5, 'Medium',      '6 pcs',  45000, 22000, 30),
  (5, 'Family Pack', '12 pcs', 65000, 32000, 20),
  -- Frozen (id=6)
  (6, '10 pcs',      '10 pcs', 44000, 22000, 60),
  (6, '20 pcs',      '20 pcs', 80000, 40000, 30);

-- Admin user (password: admin123 — bcrypt hash)
INSERT INTO `admin_users` (`username`, `password`) VALUES
  ('admin', '$2b$10$Xk1Q6FvGwJzQ2V3KqW5e3eP7KqJdF5JfZ9S6WzHpLmNvYtRkXcJvC');

-- Sample Orders (last 30 days)
INSERT INTO `orders`
  (`order_number`, `customer_name`, `customer_phone`, `delivery_method`, `payment_method`, `total_price`, `profit`, `status`, `created_at`)
VALUES
  ('ORD-20260101-001', 'Andi Wijaya',   '081234567890', 'Pickup',   'Cash',     86000,  42000, 'delivered', '2026-07-10 10:30:00'),
  ('ORD-20260101-002', 'Siti Rahma',    '081987654321', 'Delivery', 'Transfer', 103000, 51000, 'delivered', '2026-07-11 11:00:00'),
  ('ORD-20260101-003', 'Budi Santoso',  '082112345678', 'Pickup',   'QRIS',     58000,  30000, 'delivered', '2026-07-12 13:15:00'),
  ('ORD-20260101-004', 'Dewi Lestari',  '083456789012', 'Delivery', 'Cash',     125000, 63000, 'delivered', '2026-07-13 09:45:00'),
  ('ORD-20260101-005', 'Reza Firmansyah','085678901234','Pickup',   'Transfer', 90000,  45000, 'delivered', '2026-07-14 14:00:00'),
  ('ORD-20260101-006', 'Mega Putri',    '087890123456', 'Pickup',   'QRIS',     71000,  35000, 'delivered', '2026-07-15 10:00:00'),
  ('ORD-20260101-007', 'Hendra Kusuma', '089012345678', 'Delivery', 'Cash',     138000, 69000, 'delivered', '2026-07-16 12:30:00'),
  ('ORD-20260101-008', 'Laila Nurhayati','081345678901','Pickup',   'Transfer', 80000,  40000, 'delivered', '2026-07-17 11:15:00'),
  ('ORD-20260101-009', 'Fajar Ramadan', '082567890123', 'Pickup',   'QRIS',     43000,  21000, 'delivered', '2026-07-18 15:30:00'),
  ('ORD-20260101-010', 'Nur Azizah',   '083789012345', 'Delivery', 'Cash',     168000, 84000, 'delivered', '2026-07-19 10:00:00'),
  ('ORD-20260101-011', 'Ahmad Fauzi',  '085901234567', 'Pickup',   'Transfer', 106000, 53000, 'delivered', '2026-07-20 13:00:00'),
  ('ORD-20260101-012', 'Rina Maulida',  '087123456789', 'Delivery', 'QRIS',     85000,  42000, 'delivered', '2026-07-21 09:30:00'),
  ('ORD-20260101-013', 'Dimas Prasetyo','089234567890', 'Pickup',   'Cash',     58000,  29000, 'delivered', '2026-07-22 14:45:00'),
  ('ORD-20260101-014', 'Putri Handayani','081456789012','Delivery', 'Transfer', 120000, 60000, 'delivered', '2026-07-23 10:30:00'),
  ('ORD-20260101-015', 'Yoga Pratama',  '082678901234', 'Pickup',   'QRIS',     44000,  22000, 'delivered', '2026-07-24 11:00:00'),
  ('ORD-20260101-016', 'Citra Dewi',   '083890123456', 'Delivery', 'Cash',     195000, 97000, 'delivered', '2026-07-25 12:15:00'),
  ('ORD-20260101-017', 'Rizky Hidayat', '085012345678', 'Pickup',   'Transfer', 68000,  34000, 'delivered', '2026-07-26 10:00:00'),
  ('ORD-20260101-018', 'Fitri Rahmawati','087234567890','Pickup',   'QRIS',     110000, 55000, 'delivered', '2026-07-27 14:30:00'),
  ('ORD-20260101-019', 'Arif Budiman',  '089456789012', 'Delivery', 'Cash',     80000,  40000, 'delivered', '2026-07-28 09:00:00'),
  ('ORD-20260101-020', 'Imas Sari',     '081678901234', 'Pickup',   'Transfer', 58000,  29000, 'delivered', '2026-07-29 13:45:00'),
  ('ORD-20260101-021', 'Deni Saputra',  '082890123456', 'Delivery', 'QRIS',     128000, 64000, 'delivered', '2026-07-30 11:30:00'),
  ('ORD-20260101-022', 'Novita Sari',   '083012345678', 'Pickup',   'Cash',     90000,  45000, 'delivered', '2026-07-31 10:00:00'),
  ('ORD-20260101-023', 'Gilang Ramadan','085234567890', 'Pickup',   'Transfer', 43000,  21000, 'delivered', '2026-08-01 14:00:00'),
  ('ORD-20260101-024', 'Wulan Sari',    '087456789012', 'Delivery', 'QRIS',     155000, 77000, 'delivered', '2026-08-02 09:30:00'),
  ('ORD-20260101-025', 'Bagas Adi',     '089678901234', 'Pickup',   'Cash',     71000,  35000, 'delivered', '2026-08-03 12:00:00'),
  ('ORD-20260101-026', 'Sinta Dewi',    '081890123456', 'Delivery', 'Transfer', 103000, 51000, 'delivered', '2026-08-04 10:30:00'),
  ('ORD-20260101-027', 'Roni Kusuma',   '082012345678', 'Pickup',   'QRIS',     58000,  29000, 'delivered', '2026-08-05 15:00:00'),
  ('ORD-20260101-028', 'Anisa Rahma',   '083234567890', 'Pickup',   'Cash',     80000,  40000, 'delivered', '2026-08-06 11:00:00'),
  ('ORD-20260101-029', 'Hadi Santoso',  '085456789012', 'Delivery', 'Transfer', 143000, 71000, 'delivered', '2026-08-07 09:00:00'),
  ('ORD-20260101-030', 'Lina Marta',    '087678901234', 'Pickup',   'QRIS',     65000,  32000, 'pending',   '2026-08-08 08:00:00');

-- Sample Order Items (linking to variant IDs)
INSERT INTO `order_items`
  (`order_id`, `product_variant_id`, `product_name`, `variant_label`, `quantity`, `unit_price`, `unit_cost`, `subtotal`)
VALUES
  (1,  1,  'Kukus Original',          'Small',       2, 25000, 12000, 50000),
  (1,  5,  'Mentai Regular',          'Medium',      1, 34000, 17000, 34000),
  (2,  4,  'Kukus Original',          'Family Pack',  1, 58000, 28000, 58000),
  (2,  9,  'Cheese Cheddar',          'Small',        1, 31000, 15000, 31000),
  (3,  4,  'Kukus Original',          'Family Pack',  1, 58000, 28000, 58000),
  (4,  11, 'Cheese Cheddar',          'Family Pack',  1, 63000, 31000, 63000),
  (4,  6,  'Mentai Regular',          'Family Pack',  1, 60000, 30000, 60000),
  (5,  6,  'Mentai Regular',          'Family Pack',  1, 60000, 30000, 60000),
  (5,  1,  'Kukus Original',          'Small',        1, 25000, 12000, 25000),
  (5,  2,  'Kukus Original',          'Regular',      1, 28000, 14000, 28000),
  (6,  10, 'Cheese Cheddar',          'Medium',       1, 40000, 20000, 40000),
  (6,  2,  'Kukus Original',          'Regular',      1, 28000, 14000, 28000),
  (7,  12, 'Cheese Cheddar Mix Mentai','Medium',      1, 45000, 22000, 45000),
  (7,  13, 'Cheese Cheddar Mix Mentai','Family Pack', 1, 65000, 32000, 65000),
  (8,  6,  'Mentai Regular',          'Family Pack',  1, 60000, 30000, 60000),
  (8,  2,  'Kukus Original',          'Regular',      1, 28000, 14000, 28000),
  (9,  3,  'Kukus Original',          'Medium',       1, 43000, 22000, 43000),
  (10, 14, 'Frozen',                  '10 pcs',       2, 44000, 22000, 88000),
  (10, 15, 'Frozen',                  '20 pcs',       1, 80000, 40000, 80000),
  (11, 7,  'Mentai Mix Original',     'Medium',       2, 45000, 22000, 90000),
  (12, 10, 'Cheese Cheddar',          'Medium',       2, 40000, 20000, 80000),
  (13, 4,  'Kukus Original',          'Family Pack',  1, 58000, 28000, 58000),
  (14, 11, 'Cheese Cheddar',          'Family Pack',  1, 63000, 31000, 63000),
  (14, 8,  'Mentai Mix Original',     'Family Pack',  1, 58000, 28000, 58000),
  (15, 14, 'Frozen',                  '10 pcs',       1, 44000, 22000, 44000),
  (16, 15, 'Frozen',                  '20 pcs',       2, 80000, 40000,160000),
  (16, 1,  'Kukus Original',          'Small',        1, 25000, 12000, 25000),
  (17, 5,  'Mentai Regular',          'Medium',       2, 34000, 17000, 68000),
  (18, 12, 'Cheese Cheddar Mix Mentai','Medium',      2, 45000, 22000, 90000),
  (19, 6,  'Mentai Regular',          'Family Pack',  1, 60000, 30000, 60000),
  (20, 4,  'Kukus Original',          'Family Pack',  1, 58000, 28000, 58000),
  (21, 8,  'Mentai Mix Original',     'Family Pack',  2, 58000, 28000,116000),
  (22, 6,  'Mentai Regular',          'Family Pack',  1, 60000, 30000, 60000),
  (22, 9,  'Cheese Cheddar',          'Small',        1, 31000, 15000, 31000),
  (23, 3,  'Kukus Original',          'Medium',       1, 43000, 22000, 43000),
  (24, 13, 'Cheese Cheddar Mix Mentai','Family Pack', 2, 65000, 32000,130000),
  (25, 10, 'Cheese Cheddar',          'Medium',       1, 40000, 20000, 40000),
  (26, 11, 'Cheese Cheddar',          'Family Pack',  1, 63000, 31000, 63000),
  (26, 2,  'Kukus Original',          'Regular',      1, 28000, 14000, 28000),
  (27, 4,  'Kukus Original',          'Family Pack',  1, 58000, 28000, 58000),
  (28, 6,  'Mentai Regular',          'Family Pack',  1, 60000, 30000, 60000),
  (28, 9,  'Cheese Cheddar',          'Small',        1, 31000, 15000, 31000),
  (29, 8,  'Mentai Mix Original',     'Family Pack',  2, 58000, 28000,116000),
  (30, 13, 'Cheese Cheddar Mix Mentai','Family Pack', 1, 65000, 32000, 65000);

-- Sample Promotions
INSERT INTO `promotions` (`name`, `description`, `discount_type`, `discount_value`, `start_date`, `end_date`, `is_active`) VALUES
  ('Promo Lebaran', 'Diskon spesial Lebaran untuk semua produk Kukus', 'percent', 10.00, '2026-03-28', '2026-04-07', 0),
  ('Weekend Spesial', 'Diskon akhir pekan untuk Mentai & Cheese', 'percent', 15.00, '2026-08-08', '2026-08-31', 1),
  ('Buy 2 Get Disc', 'Beli 2 Family Pack hemat Rp 10.000', 'fixed', 10000.00, '2026-08-01', '2026-08-15', 1);

INSERT INTO `promotion_products` (`promotion_id`, `product_id`) VALUES
  (1, 1),
  (2, 2), (2, 3), (2, 4), (2, 5),
  (3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6);

COMMIT;
