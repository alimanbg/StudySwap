CREATE DATABASE IF NOT EXISTS studyswap CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE studyswap;

DROP TABLE IF EXISTS swap_requests;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','admin') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  category VARCHAR(80) NOT NULL,
  description TEXT NULL,
  status ENUM('available','unavailable') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_items_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE swap_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  requester_id INT NOT NULL,
  item_id INT NOT NULL,
  message VARCHAR(255) NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_requests_user FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_requests_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Admin user: admin@studyswap.com / Admin123!
INSERT INTO users (full_name, email, password_hash, role)
VALUES (
  'System Admin',
  'admin@studyswap.com',
  '$2y$10$A55fDSc8JQyl6xVKNFcC3Ow6GkIO1CJ6BfW9vVn5T4vK9DqvS8N1C',
  'admin'
);

-- Demo student: student@studyswap.com / Student123!
INSERT INTO users (full_name, email, password_hash, role)
VALUES (
  'Demo Student',
  'student@studyswap.com',
  '$2y$10$5M.7s4E6xT8p3vL8hM3jOeeVV2tk6Rj4AUkjI0uf0M9m6h6ZJ7N7a',
  'student'
);

INSERT INTO items (owner_id, title, category, description, status) VALUES
(2, 'Java OOP Notes', 'Notes', 'Comprehensive notes for OOP chapter', 'available'),
(2, 'Calculus Past Papers', 'Past Paper', '2019-2024 question sets', 'available'),
(2, 'Web Programming Lab Guide', 'Guide', 'HTML/CSS/JS and PHP practical tips', 'available');
