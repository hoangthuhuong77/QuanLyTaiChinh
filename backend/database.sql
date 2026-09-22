CREATE DATABASE IF NOT EXISTS personal_finance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE personal_finance_db;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE, username VARCHAR(80) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, phone VARCHAR(20), avatar_url LONGTEXT,
  role ENUM('user','admin') NOT NULL DEFAULT 'user', status ENUM('active','locked') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS wallets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL, type VARCHAR(40) NOT NULL, initial_balance DECIMAL(18,2) NOT NULL DEFAULT 0,
  current_balance DECIMAL(18,2) NOT NULL DEFAULT 0, description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_wallet_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE, INDEX idx_wallet_user(user_id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL, type ENUM('income','expense') NOT NULL, icon VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_category_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE, UNIQUE KEY uq_category(user_id,name,type)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL,
  wallet_id BIGINT UNSIGNED NOT NULL, category_id BIGINT UNSIGNED NOT NULL,
  type ENUM('income','expense') NOT NULL, amount DECIMAL(18,2) NOT NULL,
  description VARCHAR(255), transaction_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_transaction_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_transaction_wallet FOREIGN KEY(wallet_id) REFERENCES wallets(id) ON DELETE RESTRICT,
  CONSTRAINT fk_transaction_category FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_transaction_user_date(user_id,transaction_date), INDEX idx_transaction_filter(user_id,type,category_id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS budgets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL, category_id BIGINT UNSIGNED NOT NULL,
  amount_limit DECIMAL(18,2) NOT NULL, month TINYINT UNSIGNED NOT NULL, year SMALLINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_budget_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_budget_category FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_budget(user_id,category_id,month,year)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS savings_goals (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL, target_amount DECIMAL(18,2) NOT NULL, current_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  deadline DATE, status ENUM('active','completed','paused') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_goal_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE, INDEX idx_goal_user(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transfers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  from_wallet_id BIGINT UNSIGNED NOT NULL,
  to_wallet_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  description VARCHAR(255),
  transfer_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transfer_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_transfer_from_wallet FOREIGN KEY(from_wallet_id) REFERENCES wallets(id) ON DELETE RESTRICT,
  CONSTRAINT fk_transfer_to_wallet FOREIGN KEY(to_wallet_id) REFERENCES wallets(id) ON DELETE RESTRICT,
  INDEX idx_transfer_user_date(user_id, transfer_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(40) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message VARCHAR(500) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  dedupe_key VARCHAR(190),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notification_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_notification_dedupe(user_id, dedupe_key),
  INDEX idx_notification_user_read(user_id, is_read, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS system_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('income','expense') NOT NULL,
  icon VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_system_category(name,type)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS feedback (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  type ENUM('bug','suggestion','support') NOT NULL,
  subject VARCHAR(180) NOT NULL,
  message VARCHAR(2000) NOT NULL,
  status ENUM('pending','processing','resolved') NOT NULL DEFAULT 'pending',
  admin_reply VARCHAR(2000),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_feedback_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_feedback_status(status, created_at), INDEX idx_feedback_user(user_id, created_at)
) ENGINE=InnoDB;

INSERT IGNORE INTO system_categories (name, type, icon) VALUES
  ('Ăn uống', 'expense', '🍜'), ('Di chuyển', 'expense', '🛵'), ('Mua sắm', 'expense', '🛍️'),
  ('Lương', 'income', '💼'), ('Thưởng', 'income', '🎁');

CREATE TABLE IF NOT EXISTS system_notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL, message VARCHAR(500) NOT NULL,
  type VARCHAR(40) NOT NULL DEFAULT 'system',
  status ENUM('draft','sent','archived') NOT NULL DEFAULT 'draft',
  created_by BIGINT UNSIGNED NOT NULL, sent_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_system_notification_admin FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_system_notification_status(status, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL, token_hash CHAR(64) NOT NULL UNIQUE,
  ip_address VARCHAR(64), user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL, revoked_at DATETIME NULL,
  CONSTRAINT fk_admin_session_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_admin_session_user(user_id, revoked_at, expires_at)
) ENGINE=InnoDB;
