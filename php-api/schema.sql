-- RTG CMS schema. Plain MySQL 5.7+/8.x — runs on RDS, a VPS, or cPanel MySQL.

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  role ENUM('super_admin','admin','editor') NOT NULL DEFAULT 'editor',
  is_disabled TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Singleton sections (hero, who, story, join, settings...) — one JSON doc per key.
CREATE TABLE IF NOT EXISTS content (
  k VARCHAR(64) PRIMARY KEY,
  data JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(190) NULL
);

-- Generic collections (programs, stats, gallery, people, faqs, ...).
-- One table for every list-like section: new sections need NO migration.
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  collection VARCHAR(64) NOT NULL,
  data JSON NOT NULL,
  sort INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_collection (collection, published, sort)
);

-- Chapa donations ledger.
CREATE TABLE IF NOT EXISTS donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tx_ref VARCHAR(100) NOT NULL UNIQUE,
  provider VARCHAR(16) NOT NULL DEFAULT 'chapa',
  provider_ref VARCHAR(191) NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'ETB',
  first_name VARCHAR(120) NULL,
  last_name VARCHAR(120) NULL,
  email VARCHAR(190) NULL,
  purpose VARCHAR(64) NOT NULL DEFAULT 'GENERAL',
  status ENUM('initialized','pending','success','failed') NOT NULL DEFAULT 'initialized',
  chapa_ref_id VARCHAR(120) NULL,
  raw_verify JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP NULL,
  INDEX idx_status (status, created_at)
);

-- Public form submissions (volunteer / membership / contact).
CREATE TABLE IF NOT EXISTS submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kind ENUM('volunteer','membership','contact') NOT NULL,
  name VARCHAR(190) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(64) NULL,
  message TEXT NULL,
  extra JSON NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_kind (kind, is_read, created_at)
);
