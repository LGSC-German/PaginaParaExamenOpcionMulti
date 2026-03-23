--mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS Evaluacion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE Evaluacion;

CREATE TABLE IF NOT EXISTS usuarios (
  id         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nombre     VARCHAR(100)    NOT NULL,
  email      VARCHAR(150)    NOT NULL,
  password   VARCHAR(255)    NOT NULL,
  score      DECIMAL(5,2)    NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                      ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_email (email)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS temas (
  id         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nombre     VARCHAR(100)    NOT NULL,
  created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_nombre (nombre)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO temas (nombre) VALUES
  ('Matemáticas'),
  ('Historia'),
  ('Ciencias'),
  ('Geografía'),
  ('Programación');