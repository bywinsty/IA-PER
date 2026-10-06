-- Table du sondage IA-PER (à importer dans la base "iaper", ex. via phpMyAdmin)
CREATE DATABASE IF NOT EXISTS iaper CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE iaper;

CREATE TABLE IF NOT EXISTS sondage (
  choix VARCHAR(10) NOT NULL PRIMARY KEY,
  total INT UNSIGNED NOT NULL DEFAULT 0
);

INSERT IGNORE INTO sondage (choix, total) VALUES
  ('positif', 0),
  ('negatif', 0),
  ('neutre', 0);
