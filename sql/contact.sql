-- Table des messages du formulaire de contact IA-PER (à importer dans phpMyAdmin)
CREATE DATABASE IF NOT EXISTS iaper CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE iaper;

CREATE TABLE IF NOT EXISTS messages (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  objet VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  date_envoi TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
