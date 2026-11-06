-- ===================================================================
-- Pragati University Canteen Order App
-- MySQL 8.0 Database Initialization Script
-- ===================================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS `pragati_canteen`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `pragati_canteen`;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `registration_id` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `department` VARCHAR(100),
  `role` VARCHAR(20) NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_reg_id` (`registration_id`),
  INDEX `idx_user_email` (`email`),
  INDEX `idx_user_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Food Categories Table
CREATE TABLE IF NOT EXISTS `food_categories` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `category_name` VARCHAR(100) NOT NULL UNIQUE,
  `description` VARCHAR(255),
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category_name` (`category_name`),
  INDEX `idx_category_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Food Items Table
CREATE TABLE IF NOT EXISTS `food_items` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `food_name` VARCHAR(150) NOT NULL,
  `description` VARCHAR(1000),
  `category_id` BIGINT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `image_url` VARCHAR(500),
  `available_stock` INT NOT NULL DEFAULT 0,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `available_today` BOOLEAN NOT NULL DEFAULT TRUE,
  `meal_type` VARCHAR(30) NOT NULL,
  `is_veg` BOOLEAN NOT NULL DEFAULT TRUE,
  `prep_time` VARCHAR(50),
  `is_popular` BOOLEAN NOT NULL DEFAULT FALSE,
  `version` BIGINT DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_food_name` (`food_name`),
  INDEX `idx_food_category` (`category_id`),
  INDEX `idx_food_active` (`active`),
  INDEX `idx_food_available_today` (`available_today`),
  CONSTRAINT `fk_food_category` FOREIGN KEY (`category_id`) REFERENCES `food_categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Daily Menu Items Table
CREATE TABLE IF NOT EXISTS `daily_menu_items` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `menu_date` DATE NOT NULL,
  `food_item_id` BIGINT NOT NULL,
  `available` BOOLEAN NOT NULL DEFAULT TRUE,
  `special_note` VARCHAR(255),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_date_food_item` (`menu_date`, `food_item_id`),
  INDEX `idx_menu_date` (`menu_date`),
  INDEX `idx_menu_available` (`available`),
  CONSTRAINT `fk_daily_menu_food` FOREIGN KEY (`food_item_id`) REFERENCES `food_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Carts Table
CREATE TABLE IF NOT EXISTS `carts` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL UNIQUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_cart_user` (`user_id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Cart Items Table
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `cart_id` BIGINT NOT NULL,
  `food_item_id` BIGINT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_cart_food_item` (`cart_id`, `food_item_id`),
  INDEX `idx_cart_item_cart` (`cart_id`),
  INDEX `idx_cart_item_food` (`food_item_id`),
  CONSTRAINT `fk_cart_item_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_item_food` FOREIGN KEY (`food_item_id`) REFERENCES `food_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify database creation
SELECT 'Database pragati_canteen schema initialized successfully' AS Status;

