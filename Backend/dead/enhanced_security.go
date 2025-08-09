package main

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/subtle"
	"crypto/x509"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"net"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/argon2"
	"golang.org/x/time/rate"
)

// Enhanced Security Configuration
type SecurityConfig struct {
	MaxLoginAttempts     int           `json:"max_login_attempts"`
	LockoutDuration      time.Duration `json:"lockout_duration"`
	SessionTimeout       time.Duration `json:"session_timeout"`
	PasswordMinLength    int           `json:"password_min_length"`
	RequireStrongAuth    bool          `json:"require_strong_auth"`
	EnableIPWhitelist    bool          `json:"enable_ip_whitelist"`
	EnableGeoBlocking    bool          `json:"enable_geo_blocking"`
	MaxTransactionAmount float64       `json:"max_transaction_amount"`
	DailyTransactionLimit float64      `json:"daily_transaction_limit"`
	EnableFraudDetection bool          `json:"enable_fraud_detection"`
	RequireDeviceAuth    bool          `json:"require_device_auth"`
	EnableBiometric      bool          `json:"enable_biometric"`
}

// Security Models
type SecurityEvent struct {
	ID          int       `json:"id" db:"id"`
	UserID      *int      `json:"user_id,omitempty" db:"user_id"`
	EventType   string    `json:"event_type" db:"event_type"`
	Severity    string    `json:"severity" db:"severity"`
	Description string    `json:"description" db:"description"`
	IPAddress   string    `json:"ip_address" db:"ip_address"`
	UserAgent   string    `json:"user_agent" db:"user_agent"`
	Location    string    `json:"location,omitempty" db:"location"`
	DeviceID    string    `json:"device_id,omitempty" db:"device_id"`
	Resolved    bool      `json:"resolved" db:"resolved"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

type LoginAttempt struct {
	ID        int       `json:"id" db:"id"`
	UserID    *int      `json:"user_id,omitempty" db:"user_id"`
	Email     string    `json:"email" db:"email"`
	IPAddress string    `json:"ip_address" db:"ip_address"`
	Success   bool      `json:"success" db:"success"`
	UserAgent string    `json:"user_agent" db:"user_agent"`
	Location  string    `json:"location,omitempty" db:"location"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type DeviceFingerprint struct {
	ID           int       `json:"id" db:"id"`
	UserID       int       `json:"user_id" db:"user_id"`
	DeviceID     string    `json:"device_id" db:"device_id"`
	Fingerprint  string    `json:"fingerprint" db:"fingerprint"`
	DeviceInfo   string    `json:"device_info" db:"device_info"`
	IPAddress    string    `json:"ip_address" db:"ip_address"`
	Location     string    `json:"location,omitempty" db:"location"`
	IsTrusted    bool      `json:"is_trusted" db:"is_trusted"`
	LastSeen     time.Time `json:"last_seen" db:"last_seen"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

type TwoFactorAuth struct {
	ID         int       `json:"id" db:"id"`
	UserID     int       `json:"user_id" db:"user_id"`
	Secret     string    `json:"secret" db:"secret"`
	BackupCodes string   `json:"backup_codes" db:"backup_codes"`
	IsEnabled  bool      `json:"is_enabled" db:"is_enabled"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

type BiometricAuth struct {
	ID           int       `json:"id" db:"id"`
	UserID       int       `json:"user_id" db:"user_id"`
	BiometricType string   `json:"biometric_type" db:"biometric_type"` // fingerprint, face, voice
	Template     string    `json:"template" db:"template"`
	DeviceID     string    `json:"device_id" db:"device_id"`
	IsActive     bool      `json:"is_active" db:"is_active"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

type FraudRule struct {
	ID          int     `json:"id" db:"id"`
	RuleName    string  `json:"rule_name" db:"rule_name"`
	RuleType    string  `json:"rule_type" db:"rule_type"`
	Threshold   float64 `json:"threshold" db:"threshold"`
	Action      string  `json:"action" db:"action"` // block, flag, review
	IsActive    bool    `json:"is_active" db:"is_active"`
	Description string  `json:"description" db:"description"`
}

type RiskScore struct {
	UserID           int     `json:"user_id" db:"user_id"`
	CurrentScore     int     `json:"current_score" db:"current_score"`
	LocationRisk     int     `json:"location_risk" db:"location_risk"`
	DeviceRisk       int     `json:"device_risk" db:"device_risk"`
	BehaviorRisk     int     `json:"behavior_risk" db:"behavior_risk"`
	TransactionRisk  int     `json:"transaction_risk" db:"transaction_risk"`
	LastCalculated   time.Time `json:"last_calculated" db:"last_calculated"`
}

// Enhanced Security Service
type EnhancedSecurityService struct {
	db             *sql.DB
	config         *SecurityConfig
	rateLimiters   map[string]*rate.Limiter
	blockedIPs     map[string]time.Time
	trustedIPs     map[string]bool
	loginAttempts  map[string][]time.Time
	deviceCache    map[string]*DeviceFingerprint
	fraudRules     []FraudRule
	mutex          sync.RWMutex
	privateKey     *rsa.PrivateKey
	publicKey      *rsa.PublicKey
}

// Initialize Enhanced Security
func NewEnhancedSecurityService(db *sql.DB) *EnhancedSecurityService {
	// Generate RSA key pair for additional encryption
	privateKey, _ := rsa.GenerateKey(rand.Reader, 2048)
	publicKey := &privateKey.PublicKey

	service := &EnhancedSecurityService{
		db:            db,
		rateLimiters:  make(map[string]*rate.Limiter),
		blockedIPs:    make(map[string]time.Time),
		trustedIPs:    make(map[string]bool),
		loginAttempts: make(map[string][]time.Time),
		deviceCache:   make(map[string]*DeviceFingerprint),
		privateKey:    privateKey,
		publicKey:     publicKey,
		config: &SecurityConfig{
			MaxLoginAttempts:     5,
			LockoutDuration:      15 * time.Minute,
			SessionTimeout:       30 * time.Minute,
			PasswordMinLength:    12,
			RequireStrongAuth:    true,
			EnableIPWhitelist:    false,
			EnableGeoBlocking:    true,
			MaxTransactionAmount: 10000.00,
			DailyTransactionLimit: 50000.00,
			EnableFraudDetection: true,
			RequireDeviceAuth:    true,
			EnableBiometric:      true,
		},
	}

	service.loadFraudRules()
	service.loadTrustedIPs()
	return service
}

// Advanced Rate Limiting with IP-based tracking
func (ess *EnhancedSecurityService) advancedRateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := ess.getRealIP(c)
		
		// Check if IP is blocked
		ess.mutex.RLock()
		if blockedUntil, exists := ess.blockedIPs[ip]; exists {
			if time.Now().Before(blockedUntil) {
				ess.mutex.RUnlock()
				ess.logSecurityEvent(nil, "blocked_ip_access", "high", 
					fmt.Sprintf("Blocked IP %s attempted access", ip), ip, c.GetHeader("User-Agent"))
				c.JSON(http.StatusTooManyRequests, gin.H{"error": "IP temporarily blocked"})
				c.Abort()
				return
			} else {
				// Remove expired block
				delete(ess.blockedIPs, ip)
			}
		}
		ess.mutex.RUnlock()

		// Get or create rate limiter for this IP
		ess.mutex.Lock()
		limiter, exists := ess.rateLimiters[ip]
		if !exists {
			limiter = rate.NewLimiter(rate.Every(time.Minute/60), 60) // 60 requests per minute
			ess.rateLimiters[ip] = limiter
		}
		ess.mutex.Unlock()

		if !limiter.Allow() {
			// Block IP for repeated violations
			ess.mutex.Lock()
			ess.blockedIPs[ip] = time.Now().Add(ess.config.LockoutDuration)
			ess.mutex.Unlock()

			ess.logSecurityEvent(nil, "rate_limit_exceeded", "high", 
				fmt.Sprintf("IP %s exceeded rate limit and was blocked", ip), ip, c.GetHeader("User-Agent"))
			
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "Rate limit exceeded. IP blocked temporarily."})
			c.Abort()
			return
		}

		c.Next()
	}
}

// Enhanced Authentication Middleware
func (ess *EnhancedSecurityService) enhancedAuthMiddleware(config *Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		userID, err := validateJWT(tokenString, config.JWTSecret)
		if err != nil {
			ess.logSecurityEvent(&userID, "invalid_token", "medium", 
				"Invalid JWT token used", ess.getRealIP(c), c.GetHeader("User-Agent"))
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Check device fingerprint for sensitive operations
		if ess.config.RequireDeviceAuth && ess.isSensitiveOperation(c.Request.URL.Path) {
			deviceID := c.GetHeader("X-Device-ID")
			if deviceID == "" || !ess.isDeviceTrusted(userID, deviceID) {
				ess.logSecurityEvent(&userID, "untrusted_device", "high", 
					"Untrusted device attempted sensitive operation", ess.getRealIP(c), c.GetHeader("User-Agent"))
				c.JSON(http.StatusForbidden, gin.H{"error": "Device authentication required"})
				c.Abort()
				return
			}
		}

		// Check for suspicious behavior
		if ess.detectSuspiciousBehavior(userID, c) {
			ess.logSecurityEvent(&userID, "suspicious_behavior", "high", 
				"Suspicious behavior detected", ess.getRealIP(c), c.GetHeader("User-Agent"))
			c.JSON(http.StatusForbidden, gin.H{"error": "Additional verification required"})
			c.Abort()
			return
		}

		c.Set("user_id", userID)
		c.Next()
	}
}

// Multi-Factor Authentication Middleware
func (ess *EnhancedSecurityService) mfaMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !ess.isSensitiveOperation(c.Request.URL.Path) {
			c.Next()
			return
		}

		userID := c.GetInt("user_id")
		mfaToken := c.GetHeader("X-MFA-Token")
		
		if ess.config.RequireStrongAuth {
			if mfaToken == "" {
				c.JSON(http.StatusForbidden, gin.H{"error": "MFA token required for this operation"})
				c.Abort()
				return
			}

			if !ess.validateMFAToken(userID, mfaToken) {
				ess.logSecurityEvent(&userID, "invalid_mfa", "high", 
					"Invalid MFA token provided", ess.getRealIP(c), c.GetHeader("User-Agent"))
				c.JSON(http.StatusForbidden, gin.H{"error": "Invalid MFA token"})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}

// Biometric Authentication Middleware
func (ess *EnhancedSecurityService) biometricAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !ess.config.EnableBiometric || !ess.isSensitiveOperation(c.Request.URL.Path) {
			c.Next()
			return
		}

		userID := c.GetInt("user_id")
		biometricData := c.GetHeader("X-Biometric-Data")
		biometricType := c.GetHeader("X-Biometric-Type")
		
		if biometricData != "" && biometricType != "" {
			if !ess.validateBiometric(userID, biometricType, biometricData) {
				ess.logSecurityEvent(&userID, "invalid_biometric", "high", 
					"Invalid biometric authentication", ess.getRealIP(c), c.GetHeader("User-Agent"))
				c.JSON(http.StatusForbidden, gin.H{"error": "Biometric authentication failed"})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}

// Transaction Security Middleware
func (ess *EnhancedSecurityService) transactionSecurityMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !strings.Contains(c.Request.URL.Path, "payments") && !strings.Contains(c.Request.URL.Path, "payouts") {
			c.Next()
			return
		}

		userID := c.GetInt("user_id")
		ip := ess.getRealIP(c)

		// Check transaction limits
		if !ess.checkTransactionLimits(userID, c) {
			ess.logSecurityEvent(&userID, "transaction_limit_exceeded", "high", 
				"Transaction limits exceeded", ip, c.GetHeader("User-Agent"))
			c.JSON(http.StatusForbidden, gin.H{"error": "Transaction limits exceeded"})
			c.Abort()
			return
		}

		// Fraud detection
		riskScore := ess.calculateRiskScore(userID, ip, c)
		if riskScore > 80 { // High risk threshold
			ess.logSecurityEvent(&userID, "high_risk_transaction", "critical", 
				fmt.Sprintf("High risk transaction detected (score: %d)", riskScore), ip, c.GetHeader("User-Agent"))
			c.JSON(http.StatusForbidden, gin.H{"error": "Transaction requires manual review"})
			c.Abort()
			return
		}

		// Store risk score for monitoring
		c.Set("risk_score", riskScore)
		c.Next()
	}
}

// Geo-blocking Middleware
func (ess *EnhancedSecurityService) geoBlockingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !ess.config.EnableGeoBlocking {
			c.Next()
			return
		}

		ip := ess.getRealIP(c)
		location := ess.getLocationFromIP(ip)
		
		// Block high-risk countries (customize as needed)
		blockedCountries := []string{"CN", "RU", "KP", "IR"} // Example blocked countries
		
		for _, country := range blockedCountries {
			if strings.Contains(location, country) {
				ess.logSecurityEvent(nil, "geo_blocked", "medium", 
					fmt.Sprintf("Access blocked from %s (%s)", location, ip), ip, c.GetHeader("User-Agent"))
				c.JSON(http.StatusForbidden, gin.H{"error": "Access not allowed from your location"})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}

// Advanced Input Validation and Sanitization
func (ess *EnhancedSecurityService) advancedValidationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check for SQL injection patterns
		if ess.detectSQLInjection(c) {
			ess.logSecurityEvent(nil, "sql_injection_attempt", "critical", 
				"SQL injection attempt detected", ess.getRealIP(c), c.GetHeader("User-Agent"))
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			c.Abort()
			return
		}

		// Check for XSS patterns
		if ess.detectXSS(c) {
			ess.logSecurityEvent(nil, "xss_attempt", "high", 
				"XSS attempt detected", ess.getRealIP(c), c.GetHeader("User-Agent"))
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			c.Abort()
			return
		}

		// Check for command injection
		if ess.detectCommandInjection(c) {
			ess.logSecurityEvent(nil, "command_injection_attempt", "critical", 
				"Command injection attempt detected", ess.getRealIP(c), c.GetHeader("User-Agent"))
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// CSRF Protection Middleware
func (ess *EnhancedSecurityService) csrfProtectionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == "GET" || c.Request.Method == "HEAD" || c.Request.Method == "OPTIONS" {
			c.Next()
			return
		}

		csrfToken := c.GetHeader("X-CSRF-Token")
		if csrfToken == "" {
			csrfToken = c.PostForm("csrf_token")
		}

		if !ess.validateCSRFToken(csrfToken, c) {
			ess.logSecurityEvent(nil, "csrf_attack", "high", 
				"CSRF attack detected", ess.getRealIP(c), c.GetHeader("User-Agent"))
			c.JSON(http.StatusForbidden, gin.H{"error": "CSRF token validation failed"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// Security Helper Methods
func (ess *EnhancedSecurityService) getRealIP(c *gin.Context) string {
	// Check various headers for real IP
	headers := []string{"X-Forwarded-For", "X-Real-IP", "X-Client-IP"}
	
	for _, header := range headers {
		ip := c.GetHeader(header)
		if ip != "" {
			// Take the first IP if multiple are present
			if strings.Contains(ip, ",") {
				ip = strings.TrimSpace(strings.Split(ip, ",")[0])
			}
			if net.ParseIP(ip) != nil {
				return ip
			}
		}
	}
	
	return c.ClientIP()
}

func (ess *EnhancedSecurityService) isSensitiveOperation(path string) bool {
	sensitiveOps := []string{"/payments", "/payouts", "/balance", "/withdraw"}
	for _, op := range sensitiveOps {
		if strings.Contains(path, op) {
			return true
		}
	}
	return false
}

func (ess *EnhancedSecurityService) isDeviceTrusted(userID int, deviceID string) bool {
	ess.mutex.RLock()
	defer ess.mutex.RUnlock()
	
	if device, exists := ess.deviceCache[fmt.Sprintf("%d_%s", userID, deviceID)]; exists {
		return device.IsTrusted
	}
	
	// Check database
	var trusted bool
	err := ess.db.QueryRow("SELECT is_trusted FROM device_fingerprints WHERE user_id = ? AND device_id = ?", 
		userID, deviceID).Scan(&trusted)
	
	return err == nil && trusted
}

func (ess *EnhancedSecurityService) detectSuspiciousBehavior(userID int, c *gin.Context) bool {
	ip := ess.getRealIP(c)
	userAgent := c.GetHeader("User-Agent")
	
	// Check for rapid requests from same IP
	ess.mutex.Lock()
	key := fmt.Sprintf("%d_%s", userID, ip)
	now := time.Now()
	
	if attempts, exists := ess.loginAttempts[key]; exists {
		// Remove old attempts (older than 5 minutes)
		var recentAttempts []time.Time
		for _, attempt := range attempts {
			if now.Sub(attempt) < 5*time.Minute {
				recentAttempts = append(recentAttempts, attempt)
			}
		}
		
		// Check if too many recent attempts
		if len(recentAttempts) > 10 {
			ess.mutex.Unlock()
			return true
		}
		
		ess.loginAttempts[key] = append(recentAttempts, now)
	} else {
		ess.loginAttempts[key] = []time.Time{now}
	}
	ess.mutex.Unlock()
	
	// Check for suspicious user agent patterns
	suspiciousPatterns := []string{"bot", "crawler", "spider", "scraper"}
	userAgentLower := strings.ToLower(userAgent)
	for _, pattern := range suspiciousPatterns {
		if strings.Contains(userAgentLower, pattern) {
			return true
		}
	}
	
	return false
}

func (ess *EnhancedSecurityService) validateMFAToken(userID int, token string) bool {
	// Implement TOTP validation here
	// This is a simplified version - use a proper TOTP library in production
	var secret string
	err := ess.db.QueryRow("SELECT secret FROM two_factor_auth WHERE user_id = ? AND is_enabled = true", 
		userID).Scan(&secret)
	
	if err != nil {
		return false
	}
	
	// Validate TOTP token (implement proper TOTP validation)
	return ess.validateTOTP(secret, token)
}

func (ess *EnhancedSecurityService) validateBiometric(userID int, biometricType, data string) bool {
	var template string
	err := ess.db.QueryRow("SELECT template FROM biometric_auth WHERE user_id = ? AND biometric_type = ? AND is_active = true", 
		userID, biometricType).Scan(&template)
	
	if err != nil {
		return false
	}
	
	// Compare biometric data with stored template
	return ess.compareBiometricData(template, data)
}

func (ess *EnhancedSecurityService) checkTransactionLimits(userID int, c *gin.Context) bool {
	// Get transaction amount from request
	var amount float64
	if c.Request.Method == "POST" {
		var req map[string]interface{}
		if err := c.ShouldBindJSON(&req); err == nil {
			if amt, ok := req["amount"].(float64); ok {
				amount = amt
			}
		}
	}
	
	// Check single transaction limit
	if amount > ess.config.MaxTransactionAmount {
		return false
	}
	
	// Check daily limit
	var dailyTotal float64
	err := ess.db.QueryRow(`
		SELECT COALESCE(SUM(amount), 0) 
		FROM transactions 
		WHERE user_id = ? AND DATE(created_at) = CURDATE() AND status = 'completed'
	`, userID).Scan(&dailyTotal)
	
	if err != nil {
		return false
	}
	
	return (dailyTotal + amount) <= ess.config.DailyTransactionLimit
}

func (ess *EnhancedSecurityService) calculateRiskScore(userID int, ip string, c *gin.Context) int {
	score := 0
	
	// Location risk
	location := ess.getLocationFromIP(ip)
	if ess.isHighRiskLocation(location) {
		score += 30
	}
	
	// Device risk
	deviceID := c.GetHeader("X-Device-ID")
	if deviceID == "" || !ess.isDeviceTrusted(userID, deviceID) {
		score += 25
	}
	
	// Time-based risk (unusual hours)
	hour := time.Now().Hour()
	if hour < 6 || hour > 22 {
		score += 15
	}
	
	// Transaction pattern risk
	if ess.hasUnusualTransactionPattern(userID) {
		score += 20
	}
	
	// IP reputation risk
	if ess.isHighRiskIP(ip) {
		score += 35
	}
	
	return score
}

func (ess *EnhancedSecurityService) detectSQLInjection(c *gin.Context) bool {
	patterns := []string{
		`(?i)(union|select|insert|update|delete|drop|create|alter|exec|execute)`,
		`(?i)(or|and)\s+\d+\s*=\s*\d+`,
		`(?i)'.*'`,
		`(?i)--`,
		`(?i)/\*.*\*/`,
		`(?i)xp_cmdshell`,
		`(?i)sp_executesql`,
	}
	
	// Check URL parameters
	for _, param := range c.Request.URL.Query() {
		for _, value := range param {
			for _, pattern := range patterns {
				if matched, _ := regexp.MatchString(pattern, value); matched {
					return true
				}
			}
		}
	}
	
	// Check POST data
	if c.Request.Method == "POST" {
		body, _ := c.GetRawData()
		bodyStr := string(body)
		for _, pattern := range patterns {
			if matched, _ := regexp.MatchString(pattern, bodyStr); matched {
				return true
			}
		}
	}
	
	return false
}

func (ess *EnhancedSecurityService) detectXSS(c *gin.Context) bool {
	patterns := []string{
		`(?i)<script.*?>.*?</script>`,
		`(?i)javascript:`,
		`(?i)on\w+\s*=`,
		`(?i)<iframe.*?>`,
		`(?i)<object.*?>`,
		`(?i)<embed.*?>`,
		`(?i)expression\s*\(`,
		`(?i)vbscript:`,
	}
	
	// Check all input sources
	allInputs := []string{}
	
	// URL parameters
	for _, param := range c.Request.URL.Query() {
		allInputs = append(allInputs, param...)
	}
	
	// Headers
	for _, values := range c.Request.Header {
		allInputs = append(allInputs, values...)
	}
	
	// POST data
	if c.Request.Method == "POST" {
		body, _ := c.GetRawData()
		allInputs = append(allInputs, string(body))
	}
	
	for _, input := range allInputs {
		for _, pattern := range patterns {
			if matched, _ := regexp.MatchString(pattern, input); matched {
				return true
			}
		}
	}
	
	return false
}

func (ess *EnhancedSecurityService) detectCommandInjection(c *gin.Context) bool {
	patterns := []string{
		`(?i)(;|\||&|&&|\$\(|\`|<|>)`,
		`(?i)(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ping|nslookup|dig)`,
		`(?i)(rm|mv|cp|chmod|chown|kill|killall|sudo|su)`,
		`(?i)(wget|curl|nc|telnet|ssh|ftp)`,
		`(?i)(\.\./|\.\.\\)`,
	}
	
	// Check all input sources
	allInputs := []string{}
	
	for _, param := range c.Request.URL.Query() {
		allInputs = append(allInputs, param...)
	}
	
	if c.Request.Method == "POST" {
		body, _ := c.GetRawData()
		allInputs = append(allInputs, string(body))
	}
	
	for _, input := range allInputs {
		for _, pattern := range patterns {
			if matched, _ := regexp.MatchString(pattern, input); matched {
				return true
			}
		}
	}
	
	return false
}

func (ess *EnhancedSecurityService) validateCSRFToken(token string, c *gin.Context) bool {
	if token == "" {
		return false
	}
	
	// Get session token from secure cookie or header
	sessionToken := c.GetHeader("X-Session-Token")
	if sessionToken == "" {
		cookie, err := c.Cookie("session_token")
		if err != nil {
			return false
		}
		sessionToken = cookie
	}
	
	// Generate expected CSRF token
	expectedToken := ess.generateCSRFToken(sessionToken)
	
	// Use constant time comparison to prevent timing attacks
	return subtle.ConstantTimeCompare([]byte(token), []byte(expectedToken)) == 1
}

func (ess *EnhancedSecurityService) generateCSRFToken(sessionToken string) string {
	h := hmac.New(sha256.New, []byte("csrf-secret-key"))
	h.Write([]byte(sessionToken))
	return hex.EncodeToString(h.Sum(nil))
}

func (ess *EnhancedSecurityService) getLocationFromIP(ip string) string {
	// Implement IP geolocation lookup
	// This is a placeholder - use a real geolocation service
	return "US" // Default to US
}

func (ess *EnhancedSecurityService) isHighRiskLocation(location string) bool {
	highRiskCountries := []string{"CN", "RU", "KP", "IR", "SY", "AF"}
	for _, country := range highRiskCountries {
		if strings.Contains(location, country) {
			return true
		}
	}
	return false
}

func (ess *EnhancedSecurityService) isHighRiskIP(ip string) bool {
	// Check against known malicious IP databases
	// This is a placeholder - implement real IP reputation checking
	return false
}

func (ess *EnhancedSecurityService) hasUnusualTransactionPattern(userID int) bool {
	// Analyze user's transaction history for unusual patterns
	var avgAmount, stdDev float64
	err := ess.db.QueryRow(`
		SELECT AVG(amount), STDDEV(amount) 
		FROM transactions 
		WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
	`, userID).Scan(&avgAmount, &stdDev)
	
	if err != nil {
		return false
	}
	
	// Check if current transaction is significantly different from normal pattern
	// This is a simplified check - implement more sophisticated pattern analysis
	return stdDev > avgAmount*0.5 // High variance indicates unusual pattern
}

func (ess *EnhancedSecurityService) validateTOTP(secret, token string) bool {
	// Implement proper TOTP validation
	// This is a placeholder - use a proper TOTP library like github.com/pquerna/otp
	return len(token) == 6 && token != "000000"
}

func (ess *EnhancedSecurityService) compareBiometricData(template, data string) bool {
	// Implement biometric comparison
	// This is a placeholder - use proper biometric matching algorithms
	return template == data
}

func (ess *EnhancedSecurityService) loadFraudRules() {
	rows, err := ess.db.Query("SELECT id, rule_name, rule_type, threshold, action, is_active, description FROM fraud_rules WHERE is_active = true")
	if err != nil {
		return
	}
	defer rows.Close()
	
	ess.fraudRules = []FraudRule{}
	for rows.Next() {
		var rule FraudRule
		rows.Scan(&rule.ID, &rule.RuleName, &rule.RuleType, &rule.Threshold, &rule.Action, &rule.IsActive, &rule.Description)
		ess.fraudRules = append(ess.fraudRules, rule)
	}
}

func (ess *EnhancedSecurityService) loadTrustedIPs() {
	// Load trusted IPs from configuration or database
	ess.trustedIPs["127.0.0.1"] = true
	ess.trustedIPs["::1"] = true
}

func (ess *EnhancedSecurityService) logSecurityEvent(userID *int, eventType, severity, description, ip, userAgent string) {
	location := ess.getLocationFromIP(ip)
	
	_, err := ess.db.Exec(`
		INSERT INTO security_events (user_id, event_type, severity, description, ip_address, user_agent, location) 
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, userID, eventType, severity, description, ip, userAgent, location)
	
	if err != nil {
		fmt.Printf("Failed to log security event: %v\n", err)
	}
	
	// Send alert for critical events
	if severity == "critical" {
		ess.sendSecurityAlert(eventType, description, ip)
	}
}

func (ess *EnhancedSecurityService) sendSecurityAlert(eventType, description, ip string) {
	// Implement security alert system (email, SMS, Slack, etc.)
	fmt.Printf("SECURITY ALERT: %s - %s from IP %s\n", eventType, description, ip)
}

// Password Security Functions
func (ess *EnhancedSecurityService) hashPasswordArgon2(password string) (string, error) {
	salt := make([]byte, 32)
	_, err := rand.Read(salt)
	if err != nil {
		return "", err
	}
	
	hash := argon2.IDKey([]byte(password), salt, 1, 64*1024, 4, 32)
	
	// Encode salt and hash
	encoded := base64.StdEncoding.EncodeToString(salt) + ":" + base64.StdEncoding.EncodeToString(hash)
	return encoded, nil
}

func (ess *EnhancedSecurityService) verifyPasswordArgon2(password, encoded string) bool {
	parts := strings.Split(encoded, ":")
	if len(parts) != 2 {
		return false
	}
	
	salt, err := base64.StdEncoding.DecodeString(parts[0])
	if err != nil {
		return false
	}
	
	hash, err := base64.StdEncoding.DecodeString(parts[1])
	if err != nil {
		return false
	}
	
	testHash := argon2.IDKey([]byte(password), salt, 1, 64*1024, 4, 32)
	
	return subtle.ConstantTimeCompare(hash, testHash) == 1
}

func (ess *EnhancedSecurityService) validatePasswordStrength(password string) []string {
	var errors []string
	
	if len(password) < ess.config.PasswordMinLength {
		errors = append(errors, fmt.Sprintf("Password must be at least %d characters long", ess.config.PasswordMinLength))
	}
	
	if !regexp.MustCompile(`[a-z]`).MatchString(password) {
		errors = append(errors, "Password must contain at least one lowercase letter")
	}
	
	if !regexp.MustCompile(`[A-Z]`).MatchString(password) {
		errors = append(errors, "Password must contain at least one uppercase letter")
	}
	
	if !regexp.MustCompile(`[0-9]`).MatchString(password) {
		errors = append(errors, "Password must contain at least one number")
	}
	
	if !regexp.MustCompile(`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]`).MatchString(password) {
		errors = append(errors, "Password must contain at least one special character")
	}
	
	// Check against common passwords
	commonPasswords := []string{"password", "123456", "password123", "admin", "qwerty"}
	passwordLower := strings.ToLower(password)
	for _, common := range commonPasswords {
		if passwordLower == common {
			errors = append(errors, "Password is too common")
			break
		}
	}
	
	return errors
}

// RSA Encryption for additional sensitive data protection
func (ess *EnhancedSecurityService) encryptWithRSA(data string) (string, error) {
	encrypted, err := rsa.EncryptPKCS1v15(rand.Reader, ess.publicKey, []byte(data))
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(encrypted), nil
}

func (ess *EnhancedSecurityService) decryptWithRSA(encryptedData string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(encryptedData)
	if err != nil {
		return "", err
	}
	
	decrypted, err := rsa.DecryptPKCS1v15(rand.Reader, ess.privateKey, data)
	if err != nil {
		return "", err
	}
	
	return string(decrypted), nil
}

// Export public key for client-side encryption
func (ess *EnhancedSecurityService) getPublicKeyPEM() string {
	pubKeyBytes, _ := x509.MarshalPKIXPublicKey(ess.publicKey)
	pubKeyPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "PUBLIC KEY",
		Bytes: pubKeyBytes,
	})
	return string(pubKeyPEM)
}