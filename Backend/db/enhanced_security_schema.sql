-- Enhanced Security Database Schema
-- Additional security tables for comprehensive protection

USE krili_db;

-- Login attempts tracking
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    success BOOLEAN DEFAULT FALSE,
    user_agent TEXT,
    location VARCHAR(100),
    failure_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_ip_address (ip_address),
    INDEX idx_created_at (created_at),
    INDEX idx_success (success)
);

-- Device fingerprinting
CREATE TABLE IF NOT EXISTS device_fingerprints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    fingerprint TEXT NOT NULL,
    device_info JSON,
    ip_address VARCHAR(45),
    location VARCHAR(100),
    is_trusted BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_device (user_id, device_id),
    INDEX idx_user_id (user_id),
    INDEX idx_device_id (device_id),
    INDEX idx_is_trusted (is_trusted),
    INDEX idx_last_seen (last_seen)
);

-- Two-factor authentication
CREATE TABLE IF NOT EXISTS two_factor_auth (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    secret VARCHAR(255) NOT NULL,
    backup_codes TEXT,
    is_enabled BOOLEAN DEFAULT FALSE,
    last_used TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_2fa (user_id),
    INDEX idx_is_enabled (is_enabled)
);

-- Biometric authentication
CREATE TABLE IF NOT EXISTS biometric_auth (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    biometric_type ENUM('fingerprint', 'face', 'voice', 'iris') NOT NULL,
    template TEXT NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_biometric_type (biometric_type),
    INDEX idx_device_id (device_id),
    INDEX idx_is_active (is_active)
);

-- Fraud detection rules
CREATE TABLE IF NOT EXISTS fraud_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    rule_type ENUM('amount', 'frequency', 'location', 'device', 'pattern') NOT NULL,
    threshold DECIMAL(10,2) NOT NULL,
    time_window INT DEFAULT 3600, -- seconds
    action ENUM('block', 'flag', 'review', 'alert') DEFAULT 'flag',
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rule_type (rule_type),
    INDEX idx_is_active (is_active)
);

-- Risk scoring
CREATE TABLE IF NOT EXISTS risk_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    current_score INT DEFAULT 0,
    location_risk INT DEFAULT 0,
    device_risk INT DEFAULT 0,
    behavior_risk INT DEFAULT 0,
    transaction_risk INT DEFAULT 0,
    velocity_risk INT DEFAULT 0,
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_risk (user_id),
    INDEX idx_current_score (current_score),
    INDEX idx_last_calculated (last_calculated)
);

-- IP reputation and blocking
CREATE TABLE IF NOT EXISTS ip_reputation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    reputation_score INT DEFAULT 50, -- 0-100, lower is worse
    is_blocked BOOLEAN DEFAULT FALSE,
    block_reason VARCHAR(255),
    blocked_until TIMESTAMP NULL,
    country_code VARCHAR(2),
    is_vpn BOOLEAN DEFAULT FALSE,
    is_tor BOOLEAN DEFAULT FALSE,
    is_proxy BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_ip (ip_address),
    INDEX idx_reputation_score (reputation_score),
    INDEX idx_is_blocked (is_blocked),
    INDEX idx_country_code (country_code),
    INDEX idx_blocked_until (blocked_until)
);

-- Session management with enhanced security
CREATE TABLE IF NOT EXISTS secure_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    csrf_token VARCHAR(255) NOT NULL,
    device_id VARCHAR(255),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_session_token (session_token),
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at),
    INDEX idx_last_activity (last_activity)
);

-- API rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL, -- IP or user_id
    identifier_type ENUM('ip', 'user') NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    requests_count INT DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_until TIMESTAMP NULL,
    INDEX idx_identifier (identifier, identifier_type),
    INDEX idx_endpoint (endpoint),
    INDEX idx_window_start (window_start),
    INDEX idx_blocked_until (blocked_until)
);

-- Password history (prevent reuse)
CREATE TABLE IF NOT EXISTS password_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Security notifications
CREATE TABLE IF NOT EXISTS security_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_type ENUM('login', 'transaction', 'device', 'security') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    severity ENUM('info', 'warning', 'critical') DEFAULT 'info',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_is_read (is_read),
    INDEX idx_severity (severity),
    INDEX idx_created_at (created_at)
);

-- Suspicious activity patterns
CREATE TABLE IF NOT EXISTS suspicious_patterns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pattern_name VARCHAR(100) NOT NULL,
    pattern_type ENUM('velocity', 'amount', 'location', 'device', 'time') NOT NULL,
    detection_rule JSON NOT NULL,
    risk_score INT DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pattern_type (pattern_type),
    INDEX idx_is_active (is_active)
);

-- Transaction velocity tracking
CREATE TABLE IF NOT EXISTS transaction_velocity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    time_window ENUM('1h', '24h', '7d', '30d') NOT NULL,
    transaction_count INT DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_window (user_id, time_window),
    INDEX idx_user_id (user_id),
    INDEX idx_last_reset (last_reset)
);

-- Geolocation data
CREATE TABLE IF NOT EXISTS geolocation_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    country_code VARCHAR(2),
    country_name VARCHAR(100),
    region VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(50),
    isp VARCHAR(255),
    is_high_risk BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_ip_geo (ip_address),
    INDEX idx_country_code (country_code),
    INDEX idx_is_high_risk (is_high_risk)
);

-- Encryption keys management
CREATE TABLE IF NOT EXISTS encryption_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(100) NOT NULL,
    key_type ENUM('aes', 'rsa_public', 'rsa_private', 'hmac') NOT NULL,
    key_data TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_key_name (key_name),
    INDEX idx_key_type (key_type),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at)
);

-- Audit trail for sensitive operations
CREATE TABLE IF NOT EXISTS audit_trail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_resource_type (resource_type),
    INDEX idx_created_at (created_at),
    INDEX idx_success (success)
);

-- Insert default fraud rules
INSERT INTO fraud_rules (rule_name, rule_type, threshold, time_window, action, description) VALUES
('High Amount Transaction', 'amount', 5000.00, 3600, 'review', 'Flag transactions over $5000 for manual review'),
('Rapid Transactions', 'frequency', 10.00, 300, 'block', 'Block users making more than 10 transactions in 5 minutes'),
('Foreign Country', 'location', 1.00, 86400, 'flag', 'Flag transactions from high-risk countries'),
('New Device', 'device', 1.00, 3600, 'alert', 'Alert when transaction from new/untrusted device'),
('Unusual Pattern', 'pattern', 80.00, 3600, 'review', 'Review transactions with risk score above 80');

-- Insert default suspicious patterns
INSERT INTO suspicious_patterns (pattern_name, pattern_type, detection_rule, risk_score, description) VALUES
('Velocity Spike', 'velocity', '{"max_transactions_per_hour": 20, "max_amount_per_hour": 10000}', 70, 'Detect unusual transaction velocity'),
('Round Amount Pattern', 'amount', '{"round_amounts_threshold": 5, "time_window": 3600}', 40, 'Detect multiple round amount transactions'),
('Geographic Anomaly', 'location', '{"max_distance_km": 1000, "time_window": 3600}', 60, 'Detect impossible travel patterns'),
('Device Switching', 'device', '{"max_devices_per_hour": 3}', 50, 'Detect rapid device switching'),
('Off-hours Activity', 'time', '{"start_hour": 2, "end_hour": 6}', 30, 'Detect activity during unusual hours');

-- Insert default IP reputation data for common VPN/Proxy services
INSERT INTO ip_reputation (ip_address, reputation_score, is_vpn, is_proxy, country_code) VALUES
('8.8.8.8', 90, FALSE, FALSE, 'US'),
('1.1.1.1', 90, FALSE, FALSE, 'US'),
('127.0.0.1', 100, FALSE, FALSE, 'XX');

-- Create stored procedures for security operations
DELIMITER //

CREATE PROCEDURE CheckUserRiskScore(
    IN p_user_id INT,
    OUT p_risk_score INT
)
BEGIN
    DECLARE v_location_risk INT DEFAULT 0;
    DECLARE v_device_risk INT DEFAULT 0;
    DECLARE v_behavior_risk INT DEFAULT 0;
    DECLARE v_transaction_risk INT DEFAULT 0;
    DECLARE v_velocity_risk INT DEFAULT 0;

    -- Calculate location risk
    SELECT COALESCE(AVG(CASE WHEN ir.is_blocked THEN 100 ELSE ir.reputation_score END), 50)
    INTO v_location_risk
    FROM login_attempts la
    LEFT JOIN ip_reputation ir ON la.ip_address = ir.ip_address
    WHERE la.user_id = p_user_id AND la.created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR);

    -- Calculate device risk
    SELECT CASE WHEN COUNT(*) = 0 THEN 80 ELSE 20 END
    INTO v_device_risk
    FROM device_fingerprints
    WHERE user_id = p_user_id AND is_trusted = TRUE;

    -- Calculate behavior risk based on failed login attempts
    SELECT LEAST(COUNT(*) * 10, 100)
    INTO v_behavior_risk
    FROM login_attempts
    WHERE user_id = p_user_id AND success = FALSE AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR);

    -- Calculate transaction risk
    SELECT CASE 
        WHEN COUNT(*) > 10 THEN 80
        WHEN COUNT(*) > 5 THEN 50
        ELSE 20
    END
    INTO v_transaction_risk
    FROM transactions
    WHERE user_id = p_user_id AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR);

    -- Calculate velocity risk
    SELECT CASE
        WHEN SUM(amount) > 10000 THEN 90
        WHEN SUM(amount) > 5000 THEN 60
        WHEN COUNT(*) > 20 THEN 70
        ELSE 10
    END
    INTO v_velocity_risk
    FROM transactions
    WHERE user_id = p_user_id AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR);

    -- Calculate overall risk score
    SET p_risk_score = LEAST(
        (v_location_risk * 0.2 + v_device_risk * 0.3 + v_behavior_risk * 0.2 + 
         v_transaction_risk * 0.2 + v_velocity_risk * 0.1), 100
    );

    -- Update risk scores table
    INSERT INTO risk_scores (user_id, current_score, location_risk, device_risk, behavior_risk, transaction_risk, velocity_risk)
    VALUES (p_user_id, p_risk_score, v_location_risk, v_device_risk, v_behavior_risk, v_transaction_risk, v_velocity_risk)
    ON DUPLICATE KEY UPDATE
        current_score = p_risk_score,
        location_risk = v_location_risk,
        device_risk = v_device_risk,
        behavior_risk = v_behavior_risk,
        transaction_risk = v_transaction_risk,
        velocity_risk = v_velocity_risk,
        last_calculated = NOW();
END //

CREATE PROCEDURE LogSecurityEvent(
    IN p_user_id INT,
    IN p_event_type VARCHAR(50),
    IN p_severity ENUM('low', 'medium', 'high', 'critical'),
    IN p_description TEXT,
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT,
    IN p_additional_data JSON
)
BEGIN
    DECLARE v_location VARCHAR(100) DEFAULT NULL;
    
    -- Get location from IP
    SELECT CONCAT(country_name, ', ', city)
    INTO v_location
    FROM geolocation_data
    WHERE ip_address = p_ip_address;
    
    -- Insert security event
    INSERT INTO security_events (user_id, event_type, severity, description, ip_address, user_agent, location, additional_data)
    VALUES (p_user_id, p_event_type, p_severity, p_description, p_ip_address, p_user_agent, v_location, p_additional_data);
    
    -- Create notification for critical events
    IF p_severity = 'critical' THEN
        INSERT INTO security_notifications (user_id, notification_type, title, message, severity)
        VALUES (p_user_id, 'security', 'Critical Security Alert', p_description, 'critical');
    END IF;
END //

CREATE PROCEDURE UpdateTransactionVelocity(
    IN p_user_id INT,
    IN p_amount DECIMAL(12,2)
)
BEGIN
    -- Update 1 hour window
    INSERT INTO transaction_velocity (user_id, time_window, transaction_count, total_amount, last_reset)
    VALUES (p_user_id, '1h', 1, p_amount, NOW())
    ON DUPLICATE KEY UPDATE
        transaction_count = CASE 
            WHEN last_reset < DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN 1
            ELSE transaction_count + 1
        END,
        total_amount = CASE 
            WHEN last_reset < DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN p_amount
            ELSE total_amount + p_amount
        END,
        last_reset = CASE 
            WHEN last_reset < DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN NOW()
            ELSE last_reset
        END;

    -- Update 24 hour window
    INSERT INTO transaction_velocity (user_id, time_window, transaction_count, total_amount, last_reset)
    VALUES (p_user_id, '24h', 1, p_amount, NOW())
    ON DUPLICATE KEY UPDATE
        transaction_count = CASE 
            WHEN last_reset < DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1
            ELSE transaction_count + 1
        END,
        total_amount = CASE 
            WHEN last_reset < DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN p_amount
            ELSE total_amount + p_amount
        END,
        last_reset = CASE 
            WHEN last_reset < DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN NOW()
            ELSE last_reset
        END;
END //

DELIMITER ;

-- Create triggers for automatic security monitoring
DELIMITER //

CREATE TRIGGER after_login_attempt_insert
AFTER INSERT ON login_attempts
FOR EACH ROW
BEGIN
    DECLARE v_failed_attempts INT DEFAULT 0;
    
    -- Count recent failed attempts
    SELECT COUNT(*)
    INTO v_failed_attempts
    FROM login_attempts
    WHERE email = NEW.email 
      AND success = FALSE 
      AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE);
    
    -- Block IP if too many failed attempts
    IF v_failed_attempts >= 5 THEN
        INSERT INTO ip_reputation (ip_address, reputation_score, is_blocked, block_reason, blocked_until)
        VALUES (NEW.ip_address, 0, TRUE, 'Multiple failed login attempts', DATE_ADD(NOW(), INTERVAL 1 HOUR))
        ON DUPLICATE KEY UPDATE
            is_blocked = TRUE,
            block_reason = 'Multiple failed login attempts',
            blocked_until = DATE_ADD(NOW(), INTERVAL 1 HOUR),
            reputation_score = GREATEST(reputation_score - 20, 0);
    END IF;
END //

CREATE TRIGGER after_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    -- Update transaction velocity
    CALL UpdateTransactionVelocity(NEW.user_id, NEW.amount);
    
    -- Check for suspicious patterns
    IF NEW.amount > 5000 THEN
        CALL LogSecurityEvent(NEW.user_id, 'high_amount_transaction', 'medium', 
            CONCAT('High amount transaction: $', NEW.amount), '', '', 
            JSON_OBJECT('transaction_id', NEW.id, 'amount', NEW.amount));
    END IF;
END //

DELIMITER ;

-- Create views for security monitoring
CREATE OR REPLACE VIEW security_dashboard AS
SELECT 
    'High Risk Users' as metric,
    COUNT(*) as value
FROM risk_scores 
WHERE current_score > 70
UNION ALL
SELECT 
    'Blocked IPs' as metric,
    COUNT(*) as value
FROM ip_reputation 
WHERE is_blocked = TRUE
UNION ALL
SELECT 
    'Failed Logins (24h)' as metric,
    COUNT(*) as value
FROM login_attempts 
WHERE success = FALSE AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
UNION ALL
SELECT 
    'Critical Security Events (24h)' as metric,
    COUNT(*) as value
FROM security_events 
WHERE severity = 'critical' AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR);

CREATE OR REPLACE VIEW user_security_summary AS
SELECT 
    u.id,
    u.username,
    u.email,
    rs.current_score as risk_score,
    COUNT(DISTINCT df.id) as trusted_devices,
    tfa.is_enabled as has_2fa,
    COUNT(DISTINCT ba.id) as biometric_methods,
    MAX(la.created_at) as last_login,
    COUNT(CASE WHEN se.severity = 'critical' AND se.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as critical_events_30d
FROM users u
LEFT JOIN risk_scores rs ON u.id = rs.user_id
LEFT JOIN device_fingerprints df ON u.id = df.user_id AND df.is_trusted = TRUE
LEFT JOIN two_factor_auth tfa ON u.id = tfa.user_id
LEFT JOIN biometric_auth ba ON u.id = ba.user_id AND ba.is_active = TRUE
LEFT JOIN login_attempts la ON u.id = la.user_id AND la.success = TRUE
LEFT JOIN security_events se ON u.id = se.user_id
GROUP BY u.id, u.username, u.email, rs.current_score, tfa.is_enabled;

-- Create indexes for performance
CREATE INDEX idx_security_events_severity_created ON security_events(severity, created_at);
CREATE INDEX idx_login_attempts_email_success_created ON login_attempts(email, success, created_at);
CREATE INDEX idx_transactions_user_created_amount ON transactions(user_id, created_at, amount);
CREATE INDEX idx_device_fingerprints_user_trusted ON device_fingerprints(user_id, is_trusted);

-- Clean up old data (run periodically)
-- DELETE FROM login_attempts WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
-- DELETE FROM security_events WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR) AND severity != 'critical';
-- DELETE FROM audit_trail WHERE created_at < DATE_SUB(NOW(), INTERVAL 2 YEAR);