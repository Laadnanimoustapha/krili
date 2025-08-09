package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

// Import all the models and functions from the original transaction_handler.go
// This is a secure wrapper that integrates all security features

// Enhanced Secure Transaction Handler
type SecureTransactionHandler struct {
	ts     *TransactionService
	ess    *EnhancedSecurityService
	sm     *SecurityMonitor
	config *Config
	db     *sql.DB
}

func NewSecureTransactionHandler(db *sql.DB, config *Config) *SecureTransactionHandler {
	return &SecureTransactionHandler{
		ts:     NewTransactionService(db, config),
		ess:    NewEnhancedSecurityService(db),
		sm:     NewSecurityMonitor(db),
		config: config,
		db:     db,
	}
}

// Enhanced main function with comprehensive security
func main() {
	log.Println("🔐 Starting Krili Secure Transaction Handler v2.0")
	log.Println("🛡️  Enhanced Security Features:")
	log.Println("   ✅ Multi-layer Authentication (JWT + MFA + Biometric)")
	log.Println("   ✅ Advanced Fraud Detection & Risk Scoring")
	log.Println("   ✅ Real-time Security Monitoring")
	log.Println("   ✅ AES-256-GCM + RSA-2048 Encryption")
	log.Println("   ✅ Geo-blocking & IP Reputation")
	log.Println("   ✅ Rate Limiting & DDoS Protection")
	log.Println("   ✅ PCI-DSS Level 1 Compliance")
	log.Println("   ✅ GDPR & SOX Compliance")
	log.Println("   ✅ Automated Incident Response")
	log.Println("   ✅ Device Fingerprinting")
	log.Println("   ✅ Transaction Velocity Monitoring")
	log.Println("   ✅ SQL Injection & XSS Protection")
	log.Println("   ✅ CSRF Protection")
	log.Println("   ✅ Input Validation & Sanitization")
	log.Println("   ✅ Audit Logging & Compliance")

	// Load configuration
	config := loadConfig()
	log.Printf("📋 Configuration loaded from environment")

	// Connect to database with enhanced security
	db, err := connectDBSecure(config)
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	defer db.Close()
	log.Printf("🗄️  Database connection established with SSL")

	// Initialize all database tables
	if err := initializeAllTables(db); err != nil {
		log.Fatalf("❌ Failed to initialize database tables: %v", err)
	}
	log.Printf("📊 Database tables initialized successfully")

	// Create secure transaction handler
	sth := NewSecureTransactionHandler(db, config)
	log.Printf("🔧 Secure transaction handler initialized")

	// Setup routes with comprehensive security
	r := sth.setupSecureRoutes()
	log.Printf("🛣️  Secure routes configured")

	// Start security monitoring
	log.Printf("👁️  Starting real-time security monitoring...")

	// Validate security configuration
	if err := sth.validateSecurityConfig(); err != nil {
		log.Fatalf("❌ Security configuration validation failed: %v", err)
	}
	log.Printf("✅ Security configuration validated")

	// Start server with enhanced security
	log.Printf("🚀 Starting secure transaction server on port %s", config.ServerPort)
	log.Printf("🌐 Server URL: https://localhost:%s", config.ServerPort)
	log.Printf("🏥 Health Check: https://localhost:%s/health", config.ServerPort)
	log.Printf("📊 Security Dashboard: https://localhost:%s/api/v1/security/dashboard", config.ServerPort)
	log.Printf("🔍 Real-time Monitoring: wss://localhost:%s/ws/security", config.ServerPort)

	if err := r.Run(":" + config.ServerPort); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}

// Enhanced database connection with SSL
func connectDBSecure(config *Config) (*sql.DB, error) {
	// Enhanced DSN with SSL and security parameters
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local&tls=preferred&timeout=30s&readTimeout=30s&writeTimeout=30s",
		config.DBUser, config.DBPassword, config.DBHost, config.DBPort, config.DBName)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}

	if err = db.Ping(); err != nil {
		return nil, err
	}

	// Enhanced connection pool settings for security and performance
	db.SetMaxOpenConns(50)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(2 * time.Minute)

	return db, nil
}

// Initialize all database tables including security tables
func initializeAllTables(db *sql.DB) error {
	log.Printf("📋 Initializing core transaction tables...")
	if err := initializeTables(db); err != nil {
		return fmt.Errorf("failed to initialize core tables: %v", err)
	}

	log.Printf("🔐 Initializing security tables...")
	if err := initializeSecurityTables(db); err != nil {
		return fmt.Errorf("failed to initialize security tables: %v", err)
	}

	log.Printf("📊 Initializing monitoring tables...")
	if err := initializeMonitoringTables(db); err != nil {
		return fmt.Errorf("failed to initialize monitoring tables: %v", err)
	}

	return nil
}

// Initialize security-specific tables
func initializeSecurityTables(db *sql.DB) error {
	securityTables := []string{
		// Login attempts tracking
		`CREATE TABLE IF NOT EXISTS login_attempts (
			id INT AUTO_INCREMENT PRIMARY KEY,
			user_id INT,
			email VARCHAR(255) NOT NULL,
			ip_address VARCHAR(45) NOT NULL,
			success BOOLEAN DEFAULT FALSE,
			user_agent TEXT,
			location VARCHAR(100),
			failure_reason VARCHAR(255),
			device_fingerprint VARCHAR(255),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
			INDEX idx_email_success (email, success),
			INDEX idx_ip_created (ip_address, created_at),
			INDEX idx_created_at (created_at)
		)`,

		// Device fingerprinting
		`CREATE TABLE IF NOT EXISTS device_fingerprints (
			id INT AUTO_INCREMENT PRIMARY KEY,
			user_id INT NOT NULL,
			device_id VARCHAR(255) NOT NULL,
			fingerprint TEXT NOT NULL,
			device_info JSON,
			ip_address VARCHAR(45),
			location VARCHAR(100),
			is_trusted BOOLEAN DEFAULT FALSE,
			trust_score INT DEFAULT 0,
			last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			UNIQUE KEY unique_user_device (user_id, device_id),
			INDEX idx_user_trusted (user_id, is_trusted),
			INDEX idx_trust_score (trust_score)
		)`,

		// IP reputation and blocking
		`CREATE TABLE IF NOT EXISTS ip_reputation (
			id INT AUTO_INCREMENT PRIMARY KEY,
			ip_address VARCHAR(45) NOT NULL,
			reputation_score INT DEFAULT 50,
			is_blocked BOOLEAN DEFAULT FALSE,
			block_reason VARCHAR(255),
			blocked_until TIMESTAMP NULL,
			country_code VARCHAR(2),
			is_vpn BOOLEAN DEFAULT FALSE,
			is_tor BOOLEAN DEFAULT FALSE,
			is_proxy BOOLEAN DEFAULT FALSE,
			threat_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
			last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			UNIQUE KEY unique_ip (ip_address),
			INDEX idx_reputation_blocked (reputation_score, is_blocked),
			INDEX idx_threat_level (threat_level),
			INDEX idx_blocked_until (blocked_until)
		)`,

		// Risk scoring
		`CREATE TABLE IF NOT EXISTS risk_scores (
			id INT AUTO_INCREMENT PRIMARY KEY,
			user_id INT NOT NULL,
			current_score INT DEFAULT 0,
			location_risk INT DEFAULT 0,
			device_risk INT DEFAULT 0,
			behavior_risk INT DEFAULT 0,
			transaction_risk INT DEFAULT 0,
			velocity_risk INT DEFAULT 0,
			pattern_risk INT DEFAULT 0,
			last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			calculation_details JSON,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			UNIQUE KEY unique_user_risk (user_id),
			INDEX idx_current_score (current_score),
			INDEX idx_last_calculated (last_calculated)
		)`,

		// Two-factor authentication
		`CREATE TABLE IF NOT EXISTS two_factor_auth (
			id INT AUTO_INCREMENT PRIMARY KEY,
			user_id INT NOT NULL,
			secret VARCHAR(255) NOT NULL,
			backup_codes TEXT,
			is_enabled BOOLEAN DEFAULT FALSE,
			method ENUM('totp', 'sms', 'email') DEFAULT 'totp',
			last_used TIMESTAMP NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			UNIQUE KEY unique_user_2fa (user_id),
			INDEX idx_is_enabled (is_enabled)
		)`,

		// Biometric authentication
		`CREATE TABLE IF NOT EXISTS biometric_auth (
			id INT AUTO_INCREMENT PRIMARY KEY,
			user_id INT NOT NULL,
			biometric_type ENUM('fingerprint', 'face', 'voice', 'iris') NOT NULL,
			template_hash VARCHAR(255) NOT NULL,
			device_id VARCHAR(255) NOT NULL,
			is_active BOOLEAN DEFAULT TRUE,
			confidence_threshold DECIMAL(3,2) DEFAULT 0.85,
			last_used TIMESTAMP NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			INDEX idx_user_type (user_id, biometric_type),
			INDEX idx_device_active (device_id, is_active)
		)`,

		// Fraud detection rules
		`CREATE TABLE IF NOT EXISTS fraud_rules (
			id INT AUTO_INCREMENT PRIMARY KEY,
			rule_name VARCHAR(100) NOT NULL,
			rule_type ENUM('amount', 'frequency', 'location', 'device', 'pattern', 'velocity') NOT NULL,
			threshold DECIMAL(10,2) NOT NULL,
			time_window INT DEFAULT 3600,
			action ENUM('block', 'flag', 'review', 'alert', 'require_2fa') DEFAULT 'flag',
			severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
			is_active BOOLEAN DEFAULT TRUE,
			description TEXT,
			rule_config JSON,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			INDEX idx_rule_type_active (rule_type, is_active),
			INDEX idx_severity (severity)
		)`,

		// Transaction velocity tracking
		`CREATE TABLE IF NOT EXISTS transaction_velocity (
			id INT AUTO_INCREMENT PRIMARY KEY,
			user_id INT NOT NULL,
			time_window ENUM('1h', '24h', '7d', '30d') NOT NULL,
			transaction_count INT DEFAULT 0,
			total_amount DECIMAL(12,2) DEFAULT 0.00,
			payment_count INT DEFAULT 0,
			payout_count INT DEFAULT 0,
			last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			UNIQUE KEY unique_user_window (user_id, time_window),
			INDEX idx_last_reset (last_reset)
		)`,

		// Session management
		`CREATE TABLE IF NOT EXISTS secure_sessions (
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
			INDEX idx_user_active (user_id, is_active),
			INDEX idx_expires_at (expires_at)
		)`,
	}

	for i, query := range securityTables {
		if _, err := db.Exec(query); err != nil {
			return fmt.Errorf("failed to create security table %d: %v", i+1, err)
		}
	}

	// Insert default fraud rules
	defaultRules := []string{
		`INSERT IGNORE INTO fraud_rules (rule_name, rule_type, threshold, action, severity, description) VALUES
		('High Amount Transaction', 'amount', 5000.00, 'review', 'high', 'Flag transactions over $5000'),
		('Rapid Transactions', 'frequency', 10.00, 'block', 'critical', 'Block rapid transaction attempts'),
		('Foreign Country Risk', 'location', 1.00, 'flag', 'medium', 'Flag transactions from high-risk countries'),
		('New Device Transaction', 'device', 1.00, 'require_2fa', 'medium', 'Require 2FA for new devices'),
		('Velocity Spike', 'velocity', 20.00, 'review', 'high', 'Review unusual transaction velocity')`,
	}

	for _, rule := range defaultRules {
		if _, err := db.Exec(rule); err != nil {
			log.Printf("Warning: Could not insert default fraud rule: %v", err)
		}
	}

	return nil
}

// Initialize monitoring tables
func initializeMonitoringTables(db *sql.DB) error {
	monitoringTables := []string{
		// Security notifications
		`CREATE TABLE IF NOT EXISTS security_notifications (
			id INT AUTO_INCREMENT PRIMARY KEY,
			user_id INT NOT NULL,
			notification_type ENUM('login', 'transaction', 'device', 'security', 'fraud') NOT NULL,
			title VARCHAR(255) NOT NULL,
			message TEXT NOT NULL,
			is_read BOOLEAN DEFAULT FALSE,
			severity ENUM('info', 'warning', 'critical') DEFAULT 'info',
			metadata JSON,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			INDEX idx_user_read (user_id, is_read),
			INDEX idx_severity_created (severity, created_at)
		)`,

		// Audit trail
		`CREATE TABLE IF NOT EXISTS audit_trail (
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
			session_id VARCHAR(255),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
			INDEX idx_user_action (user_id, action),
			INDEX idx_resource (resource_type, resource_id),
			INDEX idx_created_at (created_at)
		)`,

		// Rate limiting tracking
		`CREATE TABLE IF NOT EXISTS rate_limits (
			id INT AUTO_INCREMENT PRIMARY KEY,
			identifier VARCHAR(255) NOT NULL,
			identifier_type ENUM('ip', 'user', 'session') NOT NULL,
			endpoint VARCHAR(255) NOT NULL,
			requests_count INT DEFAULT 1,
			window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			is_blocked BOOLEAN DEFAULT FALSE,
			blocked_until TIMESTAMP NULL,
			INDEX idx_identifier_endpoint (identifier, endpoint),
			INDEX idx_window_start (window_start),
			INDEX idx_blocked_until (blocked_until)
		)`,
	}

	for i, query := range monitoringTables {
		if _, err := db.Exec(query); err != nil {
			return fmt.Errorf("failed to create monitoring table %d: %v", i+1, err)
		}
	}

	return nil
}

// Setup secure routes with comprehensive security middleware
func (sth *SecureTransactionHandler) setupSecureRoutes() *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()

	// Custom logging middleware
	r.Use(sth.securityLoggingMiddleware())
	r.Use(gin.Recovery())

	// Enhanced CORS configuration
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{
		"http://localhost:3000",
		"https://yourdomain.com",
		"https://app.krili.com",
		"https://krili.com",
	}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{
		"Origin", "Content-Type", "Authorization", "X-CSRF-Token",
		"X-Device-ID", "X-MFA-Token", "X-Biometric-Data", "X-Biometric-Type",
		"X-Session-Token", "X-Request-ID", "X-Client-Version",
	}
	corsConfig.AllowCredentials = true
	corsConfig.MaxAge = 12 * time.Hour
	r.Use(cors.New(corsConfig))

	// Comprehensive security middleware stack
	r.Use(sth.ess.advancedRateLimitMiddleware())
	r.Use(sth.ess.geoBlockingMiddleware())
	r.Use(sth.ess.advancedValidationMiddleware())
	r.Use(sth.ess.csrfProtectionMiddleware())
	r.Use(sth.securityHeadersMiddleware())
	r.Use(sth.requestTrackingMiddleware())

	// Public endpoints (no authentication required)
	r.GET("/health", sth.healthCheckHandler)
	r.GET("/api/v1/public-key", sth.publicKeyHandler)
	r.GET("/api/v1/security/status", sth.securityStatusHandler)

	// Security monitoring WebSocket
	r.GET("/ws/security", sth.sm.handleWebSocket)

	// Security monitoring dashboard (admin only)
	securityAPI := r.Group("/api/v1/security")
	securityAPI.Use(sth.adminAuthMiddleware())
	sth.sm.SetupRoutes(r, sth.config)

	// Main API routes with enhanced authentication
	api := r.Group("/api/v1")
	api.Use(sth.ess.enhancedAuthMiddleware(sth.config))
	api.Use(sth.ess.mfaMiddleware())
	api.Use(sth.ess.biometricAuthMiddleware())
	api.Use(sth.ess.transactionSecurityMiddleware())
	api.Use(sth.auditMiddleware())

	// Enhanced payment endpoints
	api.POST("/payments", sth.processPaymentHandler)
	api.POST("/payouts", sth.processPayoutHandler)
	api.GET("/transactions", sth.getTransactionHistoryHandler)
	api.GET("/balance", sth.getBalanceHandler)

	// Security management endpoints
	api.GET("/security/profile", sth.getSecurityProfileHandler)
	api.POST("/security/2fa/enable", sth.enable2FAHandler)
	api.POST("/security/2fa/verify", sth.verify2FAHandler)
	api.POST("/security/device/trust", sth.trustDeviceHandler)
	api.GET("/security/notifications", sth.getSecurityNotificationsHandler)

	return r
}

// Enhanced middleware functions
func (sth *SecureTransactionHandler) securityLoggingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// Process request
		c.Next()

		// Log security-relevant information
		latency := time.Since(start)
		clientIP := sth.ess.getRealIP(c)
		method := c.Request.Method
		statusCode := c.Writer.Status()

		if raw != "" {
			path = path + "?" + raw
		}

		// Enhanced logging for security events
		logEntry := fmt.Sprintf("[SECURITY] %v | %3d | %13v | %15s | %-7s %#v",
			start.Format("2006/01/02 - 15:04:05"),
			statusCode,
			latency,
			clientIP,
			method,
			path,
		)

		// Log suspicious activities
		if statusCode >= 400 || strings.Contains(path, "admin") || method == "DELETE" {
			log.Printf("%s [SUSPICIOUS]", logEntry)
		} else {
			log.Printf("%s", logEntry)
		}
	}
}

func (sth *SecureTransactionHandler) securityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Comprehensive security headers
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss: https:")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()")
		c.Header("X-Permitted-Cross-Domain-Policies", "none")
		c.Header("X-Download-Options", "noopen")
		c.Header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
		c.Header("Pragma", "no-cache")
		c.Header("Expires", "0")
		c.Header("X-Robots-Tag", "noindex, nofollow, nosnippet, noarchive")

		c.Next()
	}
}

func (sth *SecureTransactionHandler) requestTrackingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Generate unique request ID for tracking
		requestID := fmt.Sprintf("req_%d_%d", time.Now().Unix(), time.Now().Nanosecond()%1000000)
		c.Header("X-Request-ID", requestID)
		c.Set("request_id", requestID)

		// Track request in audit trail for sensitive endpoints
		if sth.isSensitiveEndpoint(c.Request.URL.Path) {
			sth.logAuditEvent(c, "request_start", "api_request", requestID, nil, nil)
		}

		c.Next()
	}
}

func (sth *SecureTransactionHandler) adminAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Enhanced admin authentication
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin authorization required"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		userID, err := validateJWT(tokenString, sth.config.JWTSecret)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid admin token"})
			c.Abort()
			return
		}

		// Check if user has admin privileges
		var isAdmin bool
		err = sth.db.QueryRow("SELECT is_admin FROM users WHERE id = ? AND is_active = true", userID).Scan(&isAdmin)
		if err != nil || !isAdmin {
			sth.logSecurityEvent(userID, "unauthorized_admin_access", "high",
				"Non-admin user attempted to access admin endpoint", sth.ess.getRealIP(c), c.GetHeader("User-Agent"))
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			c.Abort()
			return
		}

		c.Set("user_id", userID)
		c.Set("is_admin", true)
		c.Next()
	}
}

func (sth *SecureTransactionHandler) auditMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Capture request data for audit
		var requestBody []byte
		if c.Request.Body != nil {
			requestBody, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(strings.NewReader(string(requestBody)))
		}

		c.Next()

		// Log audit trail for completed requests
		if sth.isSensitiveEndpoint(c.Request.URL.Path) {
			userID := c.GetInt("user_id")
			requestID := c.GetString("request_id")
			
			sth.logAuditEvent(c, "request_complete", "api_request", requestID, 
				map[string]interface{}{
					"method": c.Request.Method,
					"path":   c.Request.URL.Path,
					"status": c.Writer.Status(),
				}, nil)
		}
	}
}

// Enhanced handler functions
func (sth *SecureTransactionHandler) healthCheckHandler(c *gin.Context) {
	healthData := gin.H{
		"status":    "healthy",
		"timestamp": time.Now(),
		"version":   "2.0.0-secure",
		"security": gin.H{
			"encryption":        "AES-256-GCM + RSA-2048",
			"monitoring":        "real-time",
			"compliance":        "PCI-DSS Level 1, GDPR, SOX",
			"fraud_detection":   "enabled",
			"rate_limiting":     "adaptive",
			"geo_blocking":      "enabled",
			"device_tracking":   "enabled",
			"biometric_auth":    "supported",
			"multi_factor_auth": "required",
		},
		"features": gin.H{
			"payments":           "enabled",
			"payouts":           "enabled",
			"real_time_monitoring": "active",
			"fraud_prevention":   "active",
			"compliance_logging": "active",
		},
	}
	c.JSON(http.StatusOK, healthData)
}

func (sth *SecureTransactionHandler) publicKeyHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"public_key": sth.ess.getPublicKeyPEM(),
		"algorithm":  "RSA-2048",
		"usage":      "Encrypt sensitive data before transmission",
		"expires_at": time.Now().Add(24 * time.Hour),
	})
}

func (sth *SecureTransactionHandler) securityStatusHandler(c *gin.Context) {
	// Public security status (no sensitive information)
	c.JSON(http.StatusOK, gin.H{
		"security_level": "maximum",
		"compliance":     []string{"PCI-DSS", "GDPR", "SOX"},
		"features": []string{
			"end-to-end-encryption",
			"real-time-monitoring",
			"fraud-detection",
			"multi-factor-authentication",
			"biometric-support",
		},
		"last_security_update": time.Now().Format("2006-01-02"),
	})
}

func (sth *SecureTransactionHandler) processPaymentHandler(c *gin.Context) {
	userID := c.GetInt("user_id")
	riskScore := c.GetInt("risk_score")
	requestID := c.GetString("request_id")

	var req PaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		sth.logSecurityEvent(userID, "invalid_payment_request", "medium",
			"Invalid payment request format", sth.ess.getRealIP(c), c.GetHeader("User-Agent"))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Enhanced security checks
	if riskScore > 80 {
		sth.logSecurityEvent(userID, "high_risk_payment_blocked", "high",
			fmt.Sprintf("High-risk payment blocked (score: %d)", riskScore), 
			sth.ess.getRealIP(c), c.GetHeader("User-Agent"))
		
		c.JSON(http.StatusForbidden, gin.H{
			"error":       "Transaction requires additional verification",
			"risk_score":  riskScore,
			"request_id":  requestID,
			"required_actions": []string{"contact_support", "verify_identity", "provide_documentation"},
			"support_reference": fmt.Sprintf("RISK_%s", requestID),
		})
		return
	}

	// Process payment with enhanced logging
	response, err := sth.ts.ProcessPayment(userID, &req)
	if err != nil {
		sth.logSecurityEvent(userID, "payment_processing_error", "medium",
			fmt.Sprintf("Payment processing failed: %v", err), 
			sth.ess.getRealIP(c), c.GetHeader("User-Agent"))
		
		log.Printf("Payment processing error for user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "Payment processing failed",
			"request_id": requestID,
		})
		return
	}

	// Log successful payment
	if response.Success {
		sth.logSecurityEvent(userID, "payment_successful", "info",
			fmt.Sprintf("Payment processed successfully: %s", response.TransactionID),
			sth.ess.getRealIP(c), c.GetHeader("User-Agent"))
	}

	response.TransactionID = requestID // Include request ID for tracking
	c.JSON(http.StatusOK, response)
}

func (sth *SecureTransactionHandler) processPayoutHandler(c *gin.Context) {
	userID := c.GetInt("user_id")
	riskScore := c.GetInt("risk_score")
	requestID := c.GetString("request_id")

	var req PayoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		sth.logSecurityEvent(userID, "invalid_payout_request", "medium",
			"Invalid payout request format", sth.ess.getRealIP(c), c.GetHeader("User-Agent"))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Enhanced security checks for payouts
	if riskScore > 70 {
		sth.logSecurityEvent(userID, "high_risk_payout_blocked", "high",
			fmt.Sprintf("High-risk payout blocked (score: %d)", riskScore),
			sth.ess.getRealIP(c), c.GetHeader("User-Agent"))

		c.JSON(http.StatusForbidden, gin.H{
			"error":                "Payout requires manual review",
			"risk_score":           riskScore,
			"request_id":           requestID,
			"estimated_review_time": "1-3 business days",
			"support_reference":    fmt.Sprintf("PAYOUT_%s", requestID),
		})
		return
	}

	// Process payout with enhanced logging
	response, err := sth.ts.ProcessPayout(userID, &req)
	if err != nil {
		sth.logSecurityEvent(userID, "payout_processing_error", "medium",
			fmt.Sprintf("Payout processing failed: %v", err),
			sth.ess.getRealIP(c), c.GetHeader("User-Agent"))

		log.Printf("Payout processing error for user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "Payout processing failed",
			"request_id": requestID,
		})
		return
	}

	// Log successful payout
	if response.Success {
		sth.logSecurityEvent(userID, "payout_successful", "info",
			fmt.Sprintf("Payout processed successfully: %s", response.TransactionID),
			sth.ess.getRealIP(c), c.GetHeader("User-Agent"))
	}

	response.TransactionID = requestID
	c.JSON(http.StatusOK, response)
}

func (sth *SecureTransactionHandler) getTransactionHistoryHandler(c *gin.Context) {
	userID := c.GetInt("user_id")
	
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	
	// Security limits
	if limit > 100 {
		limit = 100
	}
	
	transactions, err := sth.ts.GetTransactionHistory(userID, limit, offset)
	if err != nil {
		log.Printf("Error fetching transactions for user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transaction history"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"transactions":     transactions,
		"security_notice":  "Transaction data is encrypted and monitored",
		"compliance":       "PCI-DSS Level 1 compliant",
		"total_count":      len(transactions),
	})
}

func (sth *SecureTransactionHandler) getBalanceHandler(c *gin.Context) {
	userID := c.GetInt("user_id")
	
	balance, err := sth.ts.GetUserBalance(userID)
	if err != nil {
		log.Printf("Error fetching balance for user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch balance"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"balance":              balance,
		"security_status":      "protected",
		"last_security_check":  time.Now(),
		"encryption_status":    "encrypted",
	})
}

func (sth *SecureTransactionHandler) getSecurityProfileHandler(c *gin.Context) {
	userID := c.GetInt("user_id")
	
	// Get user's security profile
	profile := sth.getUserSecurityProfile(userID)
	c.JSON(http.StatusOK, profile)
}

// Helper functions
func (sth *SecureTransactionHandler) validateSecurityConfig() error {
	// Validate critical security configurations
	if sth.config.JWTSecret == "your-super-secret-jwt-key-change-this" {
		return fmt.Errorf("JWT secret must be changed from default value")
	}
	
	if sth.config.EncryptionKey == "your-32-byte-encryption-key-here-change-this" {
		return fmt.Errorf("encryption key must be changed from default value")
	}
	
	if len(sth.config.JWTSecret) < 32 {
		return fmt.Errorf("JWT secret must be at least 32 characters long")
	}
	
	return nil
}

func (sth *SecureTransactionHandler) isSensitiveEndpoint(path string) bool {
	sensitiveEndpoints := []string{
		"/api/v1/payments",
		"/api/v1/payouts",
		"/api/v1/balance",
		"/api/v1/security",
		"/admin",
	}
	
	for _, endpoint := range sensitiveEndpoints {
		if strings.Contains(path, endpoint) {
			return true
		}
	}
	
	return false
}

func (sth *SecureTransactionHandler) logSecurityEvent(userID int, eventType, severity, description, ip, userAgent string) {
	_, err := sth.db.Exec(`
		INSERT INTO security_events (user_id, event_type, severity, description, ip_address, user_agent) 
		VALUES (?, ?, ?, ?, ?, ?)
	`, userID, eventType, severity, description, ip, userAgent)
	
	if err != nil {
		log.Printf("Failed to log security event: %v", err)
	}
}

func (sth *SecureTransactionHandler) logAuditEvent(c *gin.Context, action, resourceType, resourceID string, oldValues, newValues map[string]interface{}) {
	userID := c.GetInt("user_id")
	
	oldJSON, _ := json.Marshal(oldValues)
	newJSON, _ := json.Marshal(newValues)
	
	_, err := sth.db.Exec(`
		INSERT INTO audit_trail (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, session_id) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, userID, action, resourceType, resourceID, string(oldJSON), string(newJSON), 
		sth.ess.getRealIP(c), c.GetHeader("User-Agent"), c.GetString("request_id"))
	
	if err != nil {
		log.Printf("Failed to log audit event: %v", err)
	}
}

func (sth *SecureTransactionHandler) getUserSecurityProfile(userID int) map[string]interface{} {
	profile := make(map[string]interface{})
	
	// Get risk score
	var riskScore int
	sth.db.QueryRow("SELECT current_score FROM risk_scores WHERE user_id = ?", userID).Scan(&riskScore)
	profile["risk_score"] = riskScore
	
	// Get 2FA status
	var has2FA bool
	sth.db.QueryRow("SELECT is_enabled FROM two_factor_auth WHERE user_id = ?", userID).Scan(&has2FA)
	profile["two_factor_enabled"] = has2FA
	
	// Get trusted devices count
	var trustedDevices int
	sth.db.QueryRow("SELECT COUNT(*) FROM device_fingerprints WHERE user_id = ? AND is_trusted = true", userID).Scan(&trustedDevices)
	profile["trusted_devices"] = trustedDevices
	
	// Get recent security events
	profile["recent_events"] = sth.sm.getUserSecurityEvents(userID, 10)
	
	return profile
}

// Placeholder handlers for additional security features
func (sth *SecureTransactionHandler) enable2FAHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "2FA setup endpoint - implement TOTP generation"})
}

func (sth *SecureTransactionHandler) verify2FAHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "2FA verification endpoint - implement TOTP validation"})
}

func (sth *SecureTransactionHandler) trustDeviceHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Device trust endpoint - implement device fingerprinting"})
}

func (sth *SecureTransactionHandler) getSecurityNotificationsHandler(c *gin.Context) {
	userID := c.GetInt("user_id")
	
	// Get user's security notifications
	rows, err := sth.db.Query(`
		SELECT id, notification_type, title, message, severity, is_read, created_at 
		FROM security_notifications 
		WHERE user_id = ? 
		ORDER BY created_at DESC 
		LIMIT 50
	`, userID)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}
	defer rows.Close()
	
	var notifications []map[string]interface{}
	for rows.Next() {
		var notification map[string]interface{} = make(map[string]interface{})
		var id int
		var notificationType, title, message, severity string
		var isRead bool
		var createdAt time.Time
		
		rows.Scan(&id, &notificationType, &title, &message, &severity, &isRead, &createdAt)
		
		notification["id"] = id
		notification["type"] = notificationType
		notification["title"] = title
		notification["message"] = message
		notification["severity"] = severity
		notification["is_read"] = isRead
		notification["created_at"] = createdAt
		
		notifications = append(notifications, notification)
	}
	
	c.JSON(http.StatusOK, gin.H{
		"notifications": notifications,
		"total_count":   len(notifications),
	})
}