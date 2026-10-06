-- Table des inscrits à la newsletter IA-PER (à importer dans phpMyAdmin)
CREATE DATABASE IF NOT EXISTS iaper CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE iaper;

CREATE TABLE IF NOT EXISTS newsletter (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  date_inscription TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
