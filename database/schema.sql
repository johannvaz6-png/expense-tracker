# Create and select the database in MySQL Workbench, then run this script.
CREATE DATABASE IF NOT EXISTS expense_tracker;
USE expense_tracker;

CREATE TABLE IF NOT EXISTS expenses (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(120) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category ENUM('Food', 'Transport', 'Shopping', 'Bills', 'Education', 'Other') NOT NULL,
  expense_date DATE NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_expenses_category (category),
  INDEX idx_expenses_date (expense_date)
);
