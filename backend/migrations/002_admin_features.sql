USE personal_finance_db;

SET @role_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'role');
SET @role_sql = IF(@role_exists = 0, "ALTER TABLE users ADD COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user' AFTER avatar_url", 'SELECT 1');
PREPARE role_statement FROM @role_sql;
EXECUTE role_statement;
DEALLOCATE PREPARE role_statement;

SET @status_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'status');
SET @status_sql = IF(@status_exists = 0, "ALTER TABLE users ADD COLUMN status ENUM('active','locked') NOT NULL DEFAULT 'active' AFTER role", 'SELECT 1');
PREPARE status_statement FROM @status_sql;
EXECUTE status_statement;
DEALLOCATE PREPARE status_statement;

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