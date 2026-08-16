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
-- Table: promotion_variants  (pivot — variant-level promos)
-- ------------------------------------------------------------
CREATE TABLE `promotion_variants` (
  `promotion_id`       INT UNSIGNED NOT NULL,
  `product_variant_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`promotion_id`, `product_variant_id`),
  KEY `fk_pv_variant` (`product_variant_id`),
  CONSTRAINT `fk_pv_promotion`
    FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pv_variant`
    FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`)
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

-- ------------------------------------------------------------
-- Table: expenses
-- ------------------------------------------------------------
CREATE TABLE `expenses` (
  `id`             INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `purpose`        VARCHAR(255)     NOT NULL COMMENT 'Purpose/description of the expense',
  `quantity`       INT UNSIGNED     NOT NULL DEFAULT 1,
  `original_price` DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  `expense_cost`   DECIMAL(14,2)   GENERATED ALWAYS AS (`original_price` * `quantity`) STORED,
  `created_at`     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_expenses_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: shipping_zones
-- ------------------------------------------------------------
CREATE TABLE `shipping_zones` (
  `id`            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `zone_name`     VARCHAR(200)     NOT NULL,
  `shipping_cost` DECIMAL(12,2)    NOT NULL DEFAULT 0.00,
  `created_at`    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: site_settings
-- ------------------------------------------------------------
CREATE TABLE `site_settings` (
  `key`   VARCHAR(100) NOT NULL,
  `value` TEXT         DEFAULT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `site_settings` (`key`, `value`) VALUES ('maintenance_mode', 'false');

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
  ('admin', '$2b$10$MpU.ANOYrpZfeyHeVK3JZ.yWYfnbSJ3wQyx8uMj5zFgFHXxVndrsK');

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

-- ============================================================
-- ADDITIONAL DUMMY DATA
-- ============================================================

-- Shipping Zones
INSERT INTO `shipping_zones` (`zone_name`, `shipping_cost`) VALUES
  ('Kota Malang',       10000),
  ('Kab. Malang',       15000),
  ('Kota Batu',         20000),
  ('Pasuruan',          25000),
  ('Surabaya',          35000),
  ('Sidoarjo',          30000),
  ('Gresik',            40000);

-- Expenses (operational costs over the past month)
INSERT INTO `expenses` (`purpose`, `quantity`, `original_price`, `created_at`) VALUES
  ('Bahan baku kulit dimsum',        5, 35000,  '2026-07-10 08:00:00'),
  ('Daging ayam fillet',             3, 45000,  '2026-07-10 08:00:00'),
  ('Saus mentai',                    4, 28000,  '2026-07-12 09:00:00'),
  ('Keju cheddar slice',             6, 22000,  '2026-07-12 09:00:00'),
  ('Gas LPG 3kg',                    2, 22000,  '2026-07-14 07:30:00'),
  ('Plastik kemasan',                10, 5000,  '2026-07-15 08:00:00'),
  ('Box packaging premium',         50, 3500,   '2026-07-16 10:00:00'),
  ('Stiker label produk',           100, 500,   '2026-07-16 10:00:00'),
  ('Minyak goreng 2L',               2, 38000,  '2026-07-18 08:30:00'),
  ('Bahan baku kulit dimsum',        5, 35000,  '2026-07-22 08:00:00'),
  ('Daging ayam fillet',             4, 45000,  '2026-07-22 08:00:00'),
  ('Saus mentai',                    3, 28000,  '2026-07-25 09:00:00'),
  ('Keju cheddar slice',             5, 22000,  '2026-07-25 09:00:00'),
  ('Gas LPG 3kg',                    2, 22000,  '2026-07-28 07:30:00'),
  ('Biaya kurir GoSend',             8, 15000,  '2026-07-30 12:00:00'),
  ('Bahan baku kulit dimsum',        6, 35000,  '2026-08-01 08:00:00'),
  ('Daging ayam fillet',             4, 45000,  '2026-08-01 08:00:00'),
  ('Tepung tapioka 1kg',             3, 15000,  '2026-08-02 08:00:00'),
  ('Saus mentai',                    5, 28000,  '2026-08-03 09:00:00'),
  ('Keju cheddar slice',             8, 22000,  '2026-08-03 09:00:00'),
  ('Box packaging premium',         80, 3500,   '2026-08-05 10:00:00'),
  ('Gas LPG 3kg',                    3, 22000,  '2026-08-06 07:30:00'),
  ('Serbet & tisu makan',           10, 8000,   '2026-08-07 08:00:00'),
  ('Plastik vacuum frozen',         50, 2000,   '2026-08-08 09:00:00'),
  ('Biaya kurir GoSend',            12, 15000,  '2026-08-10 12:00:00');

-- More Orders (Agustus 2026 — recent, mixed statuses)
INSERT INTO `orders`
  (`order_number`, `customer_name`, `customer_phone`, `customer_address`, `delivery_method`, `payment_method`, `total_price`, `profit`, `status`, `notes`, `created_at`)
VALUES
  ('ORD-20260809-001', 'Rizal Mahendra',  '081200001111', 'Jl. Soekarno-Hatta 25, Malang',     'Delivery', 'Transfer', 118000, 59000, 'delivered', NULL,                         '2026-08-09 09:15:00'),
  ('ORD-20260809-002', 'Kartika Sari',    '081200002222', NULL,                                  'Pickup',   'QRIS',     68000,  34000, 'delivered', NULL,                         '2026-08-09 11:30:00'),
  ('ORD-20260810-001', 'Agus Prasetyo',   '081200003333', 'Jl. Ijen 12, Malang',                'Delivery', 'Transfer', 151000, 75000, 'delivered', 'Extra saus mentai',           '2026-08-10 10:00:00'),
  ('ORD-20260810-002', 'Maya Indah',      '081200004444', NULL,                                  'Pickup',   'Cash',     86000,  43000, 'delivered', NULL,                         '2026-08-10 13:45:00'),
  ('ORD-20260810-003', 'Fauzan Akbar',    '081200005555', 'Perum Griya Shanta B-10, Malang',    'Delivery', 'QRIS',     125000, 62000, 'delivered', NULL,                         '2026-08-10 16:00:00'),
  ('ORD-20260811-001', 'Lina Marlina',    '081200006666', NULL,                                  'Pickup',   'Cash',     50000,  26000, 'delivered', NULL,                         '2026-08-11 09:00:00'),
  ('ORD-20260811-002', 'Tono Sugiarto',   '081200007777', 'Jl. Veteran 88, Malang',             'Delivery', 'Transfer', 186000, 93000, 'delivered', 'Tolong bungkus terpisah',     '2026-08-11 11:30:00'),
  ('ORD-20260811-003', 'Nadia Putri',     '081200008888', NULL,                                  'Pickup',   'QRIS',     91000,  45000, 'delivered', NULL,                         '2026-08-11 14:15:00'),
  ('ORD-20260812-001', 'Kevin Saputra',   '081200009999', 'Jl. Kawi 5, Malang',                 'Delivery', 'Cash',     103000, 51000, 'delivered', NULL,                         '2026-08-12 09:30:00'),
  ('ORD-20260812-002', 'Ratna Dewi',      '081200010000', NULL,                                  'Pickup',   'Transfer', 145000, 72000, 'delivered', 'Minta plastik tambahan',      '2026-08-12 12:00:00'),
  ('ORD-20260812-003', 'Irfan Hakim',     '081200011111', 'Jl. Dieng 17, Malang',               'Delivery', 'QRIS',     80000,  40000, 'delivered', NULL,                         '2026-08-12 15:30:00'),
  ('ORD-20260813-001', 'Sari Mulyani',    '081200012222', NULL,                                  'Pickup',   'Cash',     134000, 67000, 'delivered', NULL,                         '2026-08-13 08:45:00'),
  ('ORD-20260813-002', 'Joko Widodo',     '081200013333', 'Jl. Simpang Borobudur 3, Malang',    'Delivery', 'Transfer', 168000, 84000, 'delivered', NULL,                         '2026-08-13 11:00:00'),
  ('ORD-20260813-003', 'Ayu Lestari',     '081200014444', NULL,                                  'Pickup',   'QRIS',     56000,  28000, 'delivered', NULL,                         '2026-08-13 14:30:00'),
  ('ORD-20260814-001', 'Bambang Sutrisno','081200015555', 'Jl. Blimbing Indah A-5, Malang',     'Delivery', 'Cash',     195000, 97000, 'confirmed','Kirim jam 11 siang',           '2026-08-14 08:00:00'),
  ('ORD-20260814-002', 'Eka Safitri',     '081200016666', NULL,                                  'Pickup',   'Transfer', 71000,  35000, 'confirmed',NULL,                          '2026-08-14 09:30:00'),
  ('ORD-20260814-003', 'Doni Firmansyah', '081200017777', 'Jl. Sulfat 44, Malang',              'Delivery', 'QRIS',     110000, 55000, 'preparing','Extra keju',                   '2026-08-14 10:15:00'),
  ('ORD-20260814-004', 'Winda Kusuma',    '081200018888', NULL,                                  'Pickup',   'Cash',     43000,  21000, 'pending',  NULL,                          '2026-08-14 11:00:00'),
  ('ORD-20260814-005', 'Rudi Hartono',    '081200019999', 'Jl. Arjuno 7, Malang',               'Delivery', 'Transfer', 160000, 80000, 'pending',  'Pesanan untuk acara kantor',  '2026-08-14 12:30:00');

-- Order Items for the new orders (order IDs 31-49)
INSERT INTO `order_items`
  (`order_id`, `product_variant_id`, `product_name`, `variant_label`, `quantity`, `unit_price`, `unit_cost`, `subtotal`)
VALUES
  -- ORD-20260809-001 (id=31): 118000
  (31, 4,  'Kukus Original',           'Family Pack',  1, 58000, 28000,  58000),
  (31, 6,  'Mentai Regular',           'Family Pack',  1, 60000, 30000,  60000),
  -- ORD-20260809-002 (id=32): 68000
  (32, 5,  'Mentai Regular',           'Medium',       2, 34000, 17000,  68000),
  -- ORD-20260810-001 (id=33): 151000
  (33, 7,  'Mentai Mix Original',      'Medium',       2, 45000, 22000,  90000),
  (33, 9,  'Cheese Cheddar',           'Small',        1, 31000, 15000,  31000),
  (33, 2,  'Kukus Original',           'Regular',      1, 28000, 14000,  28000),
  -- ORD-20260810-002 (id=34): 86000
  (34, 1,  'Kukus Original',           'Small',        2, 25000, 12000,  50000),
  (34, 5,  'Mentai Regular',           'Medium',       1, 34000, 17000,  34000),
  -- ORD-20260810-003 (id=35): 125000
  (35, 13, 'Cheese Cheddar Mix Mentai','Family Pack',  1, 65000, 32000,  65000),
  (35, 6,  'Mentai Regular',           'Family Pack',  1, 60000, 30000,  60000),
  -- ORD-20260811-001 (id=36): 50000
  (36, 1,  'Kukus Original',           'Small',        2, 25000, 12000,  50000),
  -- ORD-20260811-002 (id=37): 186000
  (37, 15, 'Frozen',                   '20 pcs',       2, 80000, 40000, 160000),
  (37, 2,  'Kukus Original',           'Regular',      1, 28000, 14000,  28000),
  -- ORD-20260811-003 (id=38): 91000
  (38, 9,  'Cheese Cheddar',           'Small',        1, 31000, 15000,  31000),
  (38, 6,  'Mentai Regular',           'Family Pack',  1, 60000, 30000,  60000),
  -- ORD-20260812-001 (id=39): 103000
  (39, 3,  'Kukus Original',           'Medium',       1, 43000, 22000,  43000),
  (39, 6,  'Mentai Regular',           'Family Pack',  1, 60000, 30000,  60000),
  -- ORD-20260812-002 (id=40): 145000
  (40, 13, 'Cheese Cheddar Mix Mentai','Family Pack',  1, 65000, 32000,  65000),
  (40, 15, 'Frozen',                   '20 pcs',       1, 80000, 40000,  80000),
  -- ORD-20260812-003 (id=41): 80000
  (41, 15, 'Frozen',                   '20 pcs',       1, 80000, 40000,  80000),
  -- ORD-20260813-001 (id=42): 134000
  (42, 11, 'Cheese Cheddar',           'Family Pack',  1, 63000, 31000,  63000),
  (42, 10, 'Cheese Cheddar',           'Medium',       1, 40000, 20000,  40000),
  (42, 9,  'Cheese Cheddar',           'Small',        1, 31000, 15000,  31000),
  -- ORD-20260813-002 (id=43): 168000
  (43, 14, 'Frozen',                   '10 pcs',       2, 44000, 22000,  88000),
  (43, 15, 'Frozen',                   '20 pcs',       1, 80000, 40000,  80000),
  -- ORD-20260813-003 (id=44): 56000
  (44, 2,  'Kukus Original',           'Regular',      2, 28000, 14000,  56000),
  -- ORD-20260814-001 (id=45): 195000
  (45, 13, 'Cheese Cheddar Mix Mentai','Family Pack',  2, 65000, 32000, 130000),
  (45, 12, 'Cheese Cheddar Mix Mentai','Medium',       1, 45000, 22000,  45000),
  (45, 1,  'Kukus Original',           'Small',        1, 25000, 12000,  25000),
  -- ORD-20260814-002 (id=46): 71000
  (46, 10, 'Cheese Cheddar',           'Medium',       1, 40000, 20000,  40000),
  (46, 9,  'Cheese Cheddar',           'Small',        1, 31000, 15000,  31000),
  -- ORD-20260814-003 (id=47): 110000
  (47, 7,  'Mentai Mix Original',      'Medium',       2, 45000, 22000,  90000),
  (47, 1,  'Kukus Original',           'Small',        1, 25000, 12000,  25000),
  -- ORD-20260814-004 (id=48): 43000
  (48, 3,  'Kukus Original',           'Medium',       1, 43000, 22000,  43000),
  -- ORD-20260814-005 (id=49): 160000
  (49, 15, 'Frozen',                   '20 pcs',       2, 80000, 40000, 160000);

-- Inventory Logs (restocks and sales)
INSERT INTO `inventory_logs` (`product_variant_id`, `change_qty`, `reason`, `created_at`) VALUES
  (1,   50, 'Restock awal',              '2026-07-10 07:00:00'),
  (2,   50, 'Restock awal',              '2026-07-10 07:00:00'),
  (3,   30, 'Restock awal',              '2026-07-10 07:00:00'),
  (4,   20, 'Restock awal',              '2026-07-10 07:00:00'),
  (5,   40, 'Restock awal',              '2026-07-10 07:00:00'),
  (6,   20, 'Restock awal',              '2026-07-10 07:00:00'),
  (7,   30, 'Restock awal',              '2026-07-10 07:00:00'),
  (8,   20, 'Restock awal',              '2026-07-10 07:00:00'),
  (9,   40, 'Restock awal',              '2026-07-10 07:00:00'),
  (10,  30, 'Restock awal',              '2026-07-10 07:00:00'),
  (11,  20, 'Restock awal',              '2026-07-10 07:00:00'),
  (12,  30, 'Restock awal',              '2026-07-10 07:00:00'),
  (13,  20, 'Restock awal',              '2026-07-10 07:00:00'),
  (14,  60, 'Restock awal',              '2026-07-10 07:00:00'),
  (15,  30, 'Restock awal',              '2026-07-10 07:00:00'),
  (1,  -5,  'Penjualan harian',          '2026-07-15 17:00:00'),
  (5,  -3,  'Penjualan harian',          '2026-07-15 17:00:00'),
  (6,  -4,  'Penjualan harian',          '2026-07-18 17:00:00'),
  (9,  -2,  'Penjualan harian',          '2026-07-20 17:00:00'),
  (14, -3,  'Penjualan harian',          '2026-07-22 17:00:00'),
  (1,   30, 'Restock mingguan',          '2026-07-25 07:00:00'),
  (2,   30, 'Restock mingguan',          '2026-07-25 07:00:00'),
  (5,   20, 'Restock mingguan',          '2026-07-25 07:00:00'),
  (6,   15, 'Restock mingguan',          '2026-07-25 07:00:00'),
  (9,   20, 'Restock mingguan',          '2026-07-25 07:00:00'),
  (13, -1,  'Rusak/expired',             '2026-07-28 08:00:00'),
  (15, -2,  'Penjualan harian',          '2026-07-30 17:00:00'),
  (1,   40, 'Restock Agustus',           '2026-08-01 07:00:00'),
  (2,   40, 'Restock Agustus',           '2026-08-01 07:00:00'),
  (5,   30, 'Restock Agustus',           '2026-08-01 07:00:00'),
  (6,   20, 'Restock Agustus',           '2026-08-01 07:00:00'),
  (7,   20, 'Restock Agustus',           '2026-08-01 07:00:00'),
  (9,   25, 'Restock Agustus',           '2026-08-01 07:00:00'),
  (10,  20, 'Restock Agustus',           '2026-08-01 07:00:00'),
  (13,  15, 'Restock Agustus',           '2026-08-01 07:00:00'),
  (14,  40, 'Restock Agustus',           '2026-08-01 07:00:00'),
  (15,  20, 'Restock Agustus',           '2026-08-01 07:00:00'),
  (1,  -8,  'Penjualan harian',          '2026-08-10 17:00:00'),
  (6,  -6,  'Penjualan harian',          '2026-08-10 17:00:00'),
  (13, -4,  'Penjualan harian',          '2026-08-12 17:00:00'),
  (15, -6,  'Penjualan harian',          '2026-08-13 17:00:00');

-- ------------------------------------------------------------
-- Table: out_of_stock_settings
-- Custom messages & restock dates for out-of-stock variants
-- ------------------------------------------------------------
CREATE TABLE `out_of_stock_settings` (
  `id`          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `variant_id`  INT UNSIGNED     NOT NULL,
  `product_id`  INT UNSIGNED     NOT NULL,
  `message`     VARCHAR(500)     DEFAULT NULL,
  `restock_at`  DATETIME         DEFAULT NULL,
  `created_at`  TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_variant` (`variant_id`),
  KEY `idx_product` (`product_id`),
  CONSTRAINT `fk_oos_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_oos_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
