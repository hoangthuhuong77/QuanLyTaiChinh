USE personal_finance_db;

SET @avatar_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'avatar_url');
SET @avatar_sql = IF(@avatar_exists = 0, 'ALTER TABLE users ADD COLUMN avatar_url LONGTEXT NULL AFTER phone', 'SELECT 1');
PREPARE avatar_statement FROM @avatar_sql;
EXECUTE avatar_statement;
DEALLOCATE PREPARE avatar_statement;

CREATE TABLE IF NOT EXISTS transfers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  from_wallet_id BIGINT UNSIGNED NOT NULL,
  to_wallet_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  description VARCHAR(255), transfer_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transfer_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_transfer_from_wallet FOREIGN KEY(from_wallet_id) REFERENCES wallets(id) ON DELETE RESTRICT,
  CONSTRAINT fk_transfer_to_wallet FOREIGN KEY(to_wallet_id) REFERENCES wallets(id) ON DELETE RESTRICT,
  INDEX idx_transfer_user_date(user_id, transfer_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL, type VARCHAR(40) NOT NULL,
  title VARCHAR(150) NOT NULL, message VARCHAR(500) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE, dedupe_key VARCHAR(190),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notification_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_notification_dedupe(user_id, dedupe_key),
  INDEX idx_notification_user_read(user_id, is_read, created_at)
) ENGINE=InnoDB;
