-- Krili Transaction System Database Schema
-- This file contains all the necessary tables for the transaction system

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS krili_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE krili_db;

-- Users table (if not already exists)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
);

-- Items table (if not already exists)
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    daily_rate DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_available (is_available)
);

-- Main transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('payment', 'payout') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_ref VARCHAR(255) UNIQUE NOT NULL,
    external_transaction_id VARCHAR(255),
    item_id INT,
    rental_id INT,
    processing_fee DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL,
    failure_reason TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at),
    INDEX idx_transaction_ref (transaction_ref),
    INDEX idx_external_id (external_transaction_id)
);

-- User balances table
CREATE TABLE IF NOT EXISTS user_balances (
    user_id INT PRIMARY KEY,
    available_balance DECIMAL(10,2) DEFAULT 0.00,
    pending_balance DECIMAL(10,2) DEFAULT 0.00,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    last_payout_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (available_balance >= 0),
    CHECK (pending_balance >= 0),
    CHECK (total_earnings >= 0),
    CHECK (total_spent >= 0)
);

-- Encrypted payment data storage
CREATE TABLE IF NOT EXISTS encrypted_payment_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    data_type ENUM('card', 'bank', 'paypal', 'other') NOT NULL,
    encrypted_data TEXT NOT NULL,
    encryption_version VARCHAR(10) DEFAULT 'v1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_expires_at (expires_at)
);

-- Transaction logs for audit trail
CREATE TABLE IF NOT EXISTS transaction_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    message TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    additional_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Payment methods table (for saved payment methods)
CREATE TABLE IF NOT EXISTS user_payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('card', 'bank', 'paypal') NOT NULL,
    provider VARCHAR(50) NOT NULL,
    external_id VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    masked_details JSON, -- Store masked/safe details for display
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_default (is_default)
);

-- Refunds table
CREATE TABLE IF NOT EXISTS refunds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    refund_fee DECIMAL(10,2) DEFAULT 0.00,
    reason TEXT,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    external_refund_id VARCHAR(255),
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_status (status)
);

-- Disputes table
CREATE TABLE IF NOT EXISTS disputes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    user_id INT NOT NULL,
    type ENUM('chargeback', 'inquiry', 'fraud') NOT NULL,
    status ENUM('open', 'under_review', 'won', 'lost', 'closed') DEFAULT 'open',
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    evidence JSON,
    external_dispute_id VARCHAR(255),
    due_date TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
);

-- Webhooks table (for external payment provider webhooks)
CREATE TABLE IF NOT EXISTS webhook_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_id VARCHAR(255) UNIQUE NOT NULL,
    transaction_ref VARCHAR(255),
    status ENUM('received', 'processing', 'processed', 'failed') DEFAULT 'received',
    payload JSON NOT NULL,
    processed_at TIMESTAMP NULL,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_provider (provider),
    INDEX idx_event_type (event_type),
    INDEX idx_status (status),
    INDEX idx_transaction_ref (transaction_ref),
    INDEX idx_created_at (created_at)
);

-- Exchange rates table (for multi-currency support)
CREATE TABLE IF NOT EXISTS exchange_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(10,6) NOT NULL,
    provider VARCHAR(50) DEFAULT 'manual',
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_currencies (from_currency, to_currency),
    INDEX idx_valid_from (valid_from),
    UNIQUE KEY unique_rate (from_currency, to_currency, valid_from)
);

-- Transaction fees configuration
CREATE TABLE IF NOT EXISTS fee_configurations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_type ENUM('payment', 'payout') NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    fee_type ENUM('percentage', 'fixed', 'combined') NOT NULL,
    percentage_fee DECIMAL(5,4) DEFAULT 0.0000,
    fixed_fee DECIMAL(10,2) DEFAULT 0.00,
    minimum_fee DECIMAL(10,2) DEFAULT 0.00,
    maximum_fee DECIMAL(10,2) DEFAULT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    effective_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type_method (transaction_type, payment_method),
    INDEX idx_effective_from (effective_from),
    INDEX idx_is_active (is_active)
);

-- Security events table
CREATE TABLE IF NOT EXISTS security_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    event_type VARCHAR(50) NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    description TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    additional_data JSON,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_severity (severity),
    INDEX idx_resolved (resolved),
    INDEX idx_created_at (created_at)
);

-- Insert default fee configurations
INSERT INTO fee_configurations (transaction_type, payment_method, fee_type, percentage_fee, fixed_fee, currency) VALUES
('payment', 'card', 'combined', 0.0290, 0.30, 'USD'),
('payment', 'paypal', 'percentage', 0.0349, 0.00, 'USD'),
('payment', 'apple', 'percentage', 0.0290, 0.00, 'USD'),
('payout', 'bank', 'percentage', 0.0250, 0.00, 'USD'),
('payout', 'paypal', 'percentage', 0.0200, 0.00, 'USD');

-- Insert default exchange rates (USD as base)
INSERT INTO exchange_rates (from_currency, to_currency, rate, provider) VALUES
('USD', 'EUR', 0.85, 'manual'),
('USD', 'GBP', 0.73, 'manual'),
('EUR', 'USD', 1.18, 'manual'),
('GBP', 'USD', 1.37, 'manual');

-- Create views for common queries
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
    t.id,
    t.user_id,
    u.username,
    u.email,
    t.type,
    t.amount,
    t.currency,
    t.status,
    t.payment_method,
    t.transaction_ref,
    t.processing_fee,
    t.net_amount,
    t.created_at,
    t.completed_at,
    CASE 
        WHEN t.item_id IS NOT NULL THEN i.title 
        ELSE NULL 
    END as item_title
FROM transactions t
LEFT JOIN users u ON t.user_id = u.id
LEFT JOIN items i ON t.item_id = i.id;

CREATE OR REPLACE VIEW user_transaction_stats AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    COALESCE(ub.available_balance, 0) as available_balance,
    COALESCE(ub.pending_balance, 0) as pending_balance,
    COALESCE(ub.total_earnings, 0) as total_earnings,
    COALESCE(ub.total_spent, 0) as total_spent,
    COUNT(CASE WHEN t.type = 'payment' AND t.status = 'completed' THEN 1 END) as total_payments,
    COUNT(CASE WHEN t.type = 'payout' AND t.status = 'completed' THEN 1 END) as total_payouts,
    SUM(CASE WHEN t.type = 'payment' AND t.status = 'completed' THEN t.amount ELSE 0 END) as total_payment_amount,
    SUM(CASE WHEN t.type = 'payout' AND t.status = 'completed' THEN t.amount ELSE 0 END) as total_payout_amount
FROM users u
LEFT JOIN user_balances ub ON u.id = ub.user_id
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id, u.username, u.email, ub.available_balance, ub.pending_balance, ub.total_earnings, ub.total_spent;

-- Create stored procedures for common operations
DELIMITER //

CREATE PROCEDURE UpdateUserBalance(
    IN p_user_id INT,
    IN p_amount DECIMAL(10,2),
    IN p_transaction_type ENUM('payment', 'payout'),
    IN p_status ENUM('pending', 'completed', 'failed')
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Insert or update user balance
    INSERT INTO user_balances (user_id, available_balance, total_earnings, total_spent)
    VALUES (p_user_id, 0, 0, 0)
    ON DUPLICATE KEY UPDATE user_id = user_id;

    -- Update balance based on transaction type and status
    IF p_transaction_type = 'payment' AND p_status = 'completed' THEN
        UPDATE user_balances 
        SET total_spent = total_spent + p_amount,
            updated_at = NOW()
        WHERE user_id = p_user_id;
    ELSEIF p_transaction_type = 'payout' AND p_status = 'pending' THEN
        UPDATE user_balances 
        SET available_balance = available_balance - p_amount,
            pending_balance = pending_balance + p_amount,
            updated_at = NOW()
        WHERE user_id = p_user_id;
    ELSEIF p_transaction_type = 'payout' AND p_status = 'completed' THEN
        UPDATE user_balances 
        SET pending_balance = pending_balance - p_amount,
            updated_at = NOW()
        WHERE user_id = p_user_id;
    ELSEIF p_transaction_type = 'payout' AND p_status = 'failed' THEN
        UPDATE user_balances 
        SET available_balance = available_balance + p_amount,
            pending_balance = pending_balance - p_amount,
            updated_at = NOW()
        WHERE user_id = p_user_id;
    END IF;

    COMMIT;
END //

CREATE PROCEDURE CalculateTransactionFee(
    IN p_transaction_type ENUM('payment', 'payout'),
    IN p_payment_method VARCHAR(50),
    IN p_amount DECIMAL(10,2),
    IN p_currency VARCHAR(3),
    OUT p_fee DECIMAL(10,2)
)
BEGIN
    DECLARE v_percentage_fee DECIMAL(5,4) DEFAULT 0.0000;
    DECLARE v_fixed_fee DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_minimum_fee DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_maximum_fee DECIMAL(10,2) DEFAULT NULL;
    DECLARE v_calculated_fee DECIMAL(10,2) DEFAULT 0.00;

    -- Get fee configuration
    SELECT percentage_fee, fixed_fee, minimum_fee, maximum_fee
    INTO v_percentage_fee, v_fixed_fee, v_minimum_fee, v_maximum_fee
    FROM fee_configurations
    WHERE transaction_type = p_transaction_type
      AND payment_method = p_payment_method
      AND currency = p_currency
      AND is_active = TRUE
      AND (effective_until IS NULL OR effective_until > NOW())
    ORDER BY effective_from DESC
    LIMIT 1;

    -- Calculate fee
    SET v_calculated_fee = (p_amount * v_percentage_fee) + v_fixed_fee;

    -- Apply minimum fee
    IF v_calculated_fee < v_minimum_fee THEN
        SET v_calculated_fee = v_minimum_fee;
    END IF;

    -- Apply maximum fee
    IF v_maximum_fee IS NOT NULL AND v_calculated_fee > v_maximum_fee THEN
        SET v_calculated_fee = v_maximum_fee;
    END IF;

    SET p_fee = v_calculated_fee;
END //

DELIMITER ;

-- Create triggers for automatic logging
DELIMITER //

CREATE TRIGGER transaction_status_change_log
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO transaction_logs (transaction_id, action, status, message)
        VALUES (NEW.id, 'status_change', NEW.status, 
                CONCAT('Status changed from ', OLD.status, ' to ', NEW.status));
    END IF;
END //

CREATE TRIGGER security_event_on_failed_transaction
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
        INSERT INTO security_events (user_id, event_type, severity, description, additional_data)
        VALUES (NEW.user_id, 'transaction_failed', 'medium', 
                'Transaction failed', JSON_OBJECT('transaction_id', NEW.id, 'amount', NEW.amount));
    END IF;
END //

DELIMITER ;

-- Create indexes for performance optimization
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX idx_transactions_created_status ON transactions(created_at, status);
CREATE INDEX idx_transaction_logs_created ON transaction_logs(created_at);
CREATE INDEX idx_webhook_events_created ON webhook_events(created_at);
CREATE INDEX idx_security_events_created ON security_events(created_at);

-- Grant permissions (adjust as needed for your setup)
-- CREATE USER IF NOT EXISTS 'krili_transaction'@'localhost' IDENTIFIED BY 'secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON krili_db.* TO 'krili_transaction'@'localhost';
-- FLUSH PRIVILEGES;