-- Create the database
CREATE DATABASE IF NOT EXISTS brbxfjw1fo1dbiujuhy7;
USE brbxfjw1fo1dbiujuhy7;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_picture VARCHAR(255),
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Social login connections
CREATE TABLE IF NOT EXISTS social_logins (
    social_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_social_login (provider, provider_user_id)
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
    reset_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- User verification tokens
CREATE TABLE IF NOT EXISTS verification_tokens (
    token_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Sample data for testing
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, is_verified) VALUES
('john.doe@example.com', '$2a$10$X7UrH5YxX5YxX5YxX5YxXO', 'John', 'Doe', '+1234567890', TRUE),
('jane.smith@example.com', '$2a$10$X7UrH5YxX5YxX5YxX5YxXO', 'Jane', 'Smith', '+1987654321', TRUE),
('admin@krili.com', '$2a$10$X7UrH5YxX5YxX5YxX5YxXO', 'Admin', 'User', '+1122334455', TRUE),
('user4@example.com', '$2a$10$X7UrH5YxX5YxX5YxX5YxXO', 'User', 'Four', '+1234567890', TRUE);

-- TEST V23 JUST FORE FUNNE
INSERT INTO social_logins (user_id, provider, provider_user_id) VALUES
(1, 'google', 'google123'),
(2, 'facebook', 'facebook456');

-- Create indexes for better performance
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_token ON user_sessions(token);
CREATE INDEX idx_social_provider ON social_logins(provider, provider_user_id);
CREATE INDEX idx_reset_token ON password_resets(token);
CREATE INDEX idx_verification_token ON verification_tokens(token);

-- Create a view for active users
CREATE VIEW active_users AS
SELECT user_id, email, first_name, last_name, phone_number, created_at, last_login
FROM users
WHERE is_active = TRUE;

DELIMITER //
CREATE PROCEDURE register_user(
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_first_name VARCHAR(100),
    IN p_last_name VARCHAR(100),
    IN p_phone_number VARCHAR(20)
)
BEGIN
    DECLARE v_user_id INT;

    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
        SELECT 'error' as status, 'Email already registered' as message;
    ELSE
        -- Insert new user
        INSERT INTO users (email, password_hash, first_name, last_name, phone_number)
        VALUES (p_email, p_password_hash, p_first_name, p_last_name, p_phone_number);

        SET v_user_id = LAST_INSERT_ID();

        -- Create verification token
        INSERT INTO verification_tokens (user_id, token, expires_at)
        VALUES (v_user_id, UUID(), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 24 HOUR));

        SELECT 'success' as status, v_user_id as user_id;
    END IF;
END //
DELIMITER ;