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
	"regexp"
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

// Configuration and Environment Variables
type Config struct {
	DBHost         string
	DBPort         string
	DBUser         string
	DBPassword     string
	DBName         string
	JWTSecret      string
	EncryptionKey  string
	StripeKey      string
	PayPalKey      string
	ServerPort     string
}

// Transaction Models
type Transaction struct {
	ID              int       `json:"id" db:"id"`
	UserID          int       `json:"user_id" db:"user_id"`
	Type            string    `json:"type" db:"type"` // payment, payout
	Amount          float64   `json:"amount" db:"amount"`
	Currency        string    `json:"currency" db:"currency"`
	Status          string    `json:"status" db:"status"` // pending, completed, failed, cancelled
	PaymentMethod   string    `json:"payment_method" db:"payment_method"`
	TransactionRef  string    `json:"transaction_ref" db:"transaction_ref"`
	ItemID          *int      `json:"item_id,omitempty" db:"item_id"`
	ProcessingFee   float64   `json:"processing_fee" db:"processing_fee"`
	NetAmount       float64   `json:"net_amount" db:"net_amount"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
	CompletedAt     *time.Time `json:"completed_at,omitempty" db:"completed_at"`
}

type PaymentRequest struct {
	Amount        float64            `json:"amount" binding:"required,min=0.01"`
	Currency      string             `json:"currency" binding:"required"`
	PaymentMethod string             `json:"payment_method" binding:"required"`
	ItemID        int                `json:"item_id" binding:"required"`
	CardDetails   *CardDetails       `json:"card_details,omitempty"`
	BillingInfo   *BillingInfo       `json:"billing_info,omitempty"`
	Metadata      map[string]string  `json:"metadata,omitempty"`
}

type PayoutRequest struct {
	Amount        float64            `json:"amount" binding:"required,min=0.01"`
	Currency      string             `json:"currency" binding:"required"`
	PayoutMethod  string             `json:"payout_method" binding:"required"`
	BankDetails   *BankDetails       `json:"bank_details,omitempty"`
	PayPalEmail   string             `json:"paypal_email,omitempty"`
	Metadata      map[string]string  `json:"metadata,omitempty"`
}

type CardDetails struct {
	Number      string `json:"number" binding:"required"`
	ExpiryMonth string `json:"expiry_month" binding:"required"`
	ExpiryYear  string `json:"expiry_year" binding:"required"`
	CVV         string `json:"cvv" binding:"required"`
	HolderName  string `json:"holder_name" binding:"required"`
}

type BillingInfo struct {
	Country string `json:"country" binding:"required"`
	ZipCode string `json:"zip_code" binding:"required"`
	Address string `json:"address,omitempty"`
	City    string `json:"city,omitempty"`
	State   string `json:"state,omitempty"`
}

type BankDetails struct {
	AccountHolder string `json:"account_holder" binding:"required"`
	BankName      string `json:"bank_name" binding:"required"`
	AccountType   string `json:"account_type" binding:"required"`
	RoutingNumber string `json:"routing_number" binding:"required"`
	AccountNumber string `json:"account_number" binding:"required"`
}

type UserBalance struct {
	UserID          int     `json:"user_id" db:"user_id"`
	AvailableBalance float64 `json:"available_balance" db:"available_balance"`
	PendingBalance   float64 `json:"pending_balance" db:"pending_balance"`
	TotalEarnings    float64 `json:"total_earnings" db:"total_earnings"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

type TransactionResponse struct {
	Success       bool        `json:"success"`
	Message       string      `json:"message"`
	Transaction   *Transaction `json:"transaction,omitempty"`
	TransactionID string      `json:"transaction_id,omitempty"`
	Status        string      `json:"status,omitempty"`
}

// Database and Service Handlers
type TransactionService struct {
	db     *sql.DB
	config *Config
}

// Initialize configuration
func loadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	return &Config{
		DBHost:        getEnv("DB_HOST", "localhost"),
		DBPort:        getEnv("DB_PORT", "3306"),
		DBUser:        getEnv("DB_USER", "root"),
		DBPassword:    getEnv("DB_PASSWORD", ""),
		DBName:        getEnv("DB_NAME", "krili_db"),
		JWTSecret:     getEnv("JWT_SECRET", "your-super-secret-jwt-key-change-this"),
		EncryptionKey: getEnv("ENCRYPTION_KEY", "your-32-byte-encryption-key-here"),
		StripeKey:     getEnv("STRIPE_SECRET_KEY", ""),
		PayPalKey:     getEnv("PAYPAL_SECRET_KEY", ""),
		ServerPort:    getEnv("SERVER_PORT", "8080"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// Database connection
func connectDB(config *Config) (*sql.DB, error) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		config.DBUser, config.DBPassword, config.DBHost, config.DBPort, config.DBName)
	
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}

	if err = db.Ping(); err != nil {
		return nil, err
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	return db, nil
}

// Initialize database tables
func initializeTables(db *sql.DB) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS transactions (
			id INT AUTO_INCREMENT PRIMARY KEY,
			user_id INT NOT NULL,
			type ENUM('payment', 'payout') NOT NULL,
			amount DECIMAL(10,2) NOT NULL,
			currency VARCHAR(3) DEFAULT 'USD',
			status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
			payment_method VARCHAR(50),
			transaction_ref VARCHAR(255) UNIQUE,
			item_id INT,
			processing_fee DECIMAL(10,2) DEFAULT 0.00,
			net_amount DECIMAL(10,2) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			completed_at TIMESTAMP NULL,
			INDEX idx_user_id (user_id),
			INDEX idx_status (status),
			INDEX idx_type (type),
			INDEX idx_created_at (created_at)
		)`,
		`CREATE TABLE IF NOT EXISTS user_balances (
			user_id INT PRIMARY KEY,
			available_balance DECIMAL(10,2) DEFAULT 0.00,
			pending_balance DECIMAL(10,2) DEFAULT 0.00,
			total_earnings DECIMAL(10,2) DEFAULT 0.00,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS encrypted_payment_data (
			id INT AUTO_INCREMENT PRIMARY KEY,
			transaction_id INT NOT NULL,
			encrypted_data TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
		)`,
		`CREATE TABLE IF NOT EXISTS transaction_logs (
			id INT AUTO_INCREMENT PRIMARY KEY,
			transaction_id INT NOT NULL,
			action VARCHAR(50) NOT NULL,
			status VARCHAR(50) NOT NULL,
			message TEXT,
			ip_address VARCHAR(45),
			user_agent TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
		)`,
	}

	for _, query := range queries {
		if _, err := db.Exec(query); err != nil {
			return fmt.Errorf("failed to create table: %v", err)
		}
	}

	return nil
}

// Encryption utilities
func encrypt(plaintext, key string) (string, error) {
	keyBytes := []byte(key)
	if len(keyBytes) != 32 {
		keyBytes = sha256.Sum256(keyBytes)
	}

	block, err := aes.NewCipher(keyBytes[:])
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func decrypt(ciphertext, key string) (string, error) {
	keyBytes := []byte(key)
	if len(keyBytes) != 32 {
		keyBytes = sha256.Sum256(keyBytes)
	}

	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(keyBytes[:])
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return "", fmt.Errorf("ciphertext too short")
	}

	nonce, ciphertext_bytes := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext_bytes, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

// JWT utilities
func generateJWT(userID int, secret string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
		"iat":     time.Now().Unix(),
	})

	return token.SignedString([]byte(secret))
}

func validateJWT(tokenString, secret string) (int, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return 0, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID := int(claims["user_id"].(float64))
		return userID, nil
	}

	return 0, fmt.Errorf("invalid token")
}

// Validation utilities
func validateCardNumber(cardNumber string) bool {
	// Remove spaces and check if it's numeric
	cleaned := strings.ReplaceAll(cardNumber, " ", "")
	if len(cleaned) < 13 || len(cleaned) > 19 {
		return false
	}

	// Luhn algorithm
	sum := 0
	alternate := false
	for i := len(cleaned) - 1; i >= 0; i-- {
		digit, _ := strconv.Atoi(string(cleaned[i]))
		if alternate {
			digit *= 2
			if digit > 9 {
				digit = (digit % 10) + 1
			}
		}
		sum += digit
		alternate = !alternate
	}
	return sum%10 == 0
}

func validateEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

func validateExpiryDate(month, year string) bool {
	m, err1 := strconv.Atoi(month)
	y, err2 := strconv.Atoi(year)
	if err1 != nil || err2 != nil {
		return false
	}

	if m < 1 || m > 12 {
		return false
	}

	currentYear := time.Now().Year() % 100
	currentMonth := int(time.Now().Month())

	if y < currentYear || (y == currentYear && m < currentMonth) {
		return false
	}

	return true
}

// Transaction Service Methods
func NewTransactionService(db *sql.DB, config *Config) *TransactionService {
	return &TransactionService{
		db:     db,
		config: config,
	}
}

func (ts *TransactionService) ProcessPayment(userID int, req *PaymentRequest) (*TransactionResponse, error) {
	// Validate payment request
	if err := ts.validatePaymentRequest(req); err != nil {
		return &TransactionResponse{
			Success: false,
			Message: fmt.Sprintf("Validation error: %v", err),
		}, nil
	}

	// Generate transaction reference
	transactionRef := ts.generateTransactionRef("PAY")

	// Calculate fees
	processingFee := req.Amount * 0.029 // 2.9% processing fee
	netAmount := req.Amount - processingFee

	// Create transaction record
	tx, err := ts.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	query := `INSERT INTO transactions (user_id, type, amount, currency, payment_method, transaction_ref, item_id, processing_fee, net_amount, status) 
			  VALUES (?, 'payment', ?, ?, ?, ?, ?, ?, ?, 'processing')`
	
	result, err := tx.Exec(query, userID, req.Amount, req.Currency, req.PaymentMethod, transactionRef, req.ItemID, processingFee, netAmount)
	if err != nil {
		return nil, err
	}

	transactionID, _ := result.LastInsertId()

	// Encrypt and store sensitive payment data
	if req.CardDetails != nil {
		if err := ts.storeEncryptedPaymentData(tx, int(transactionID), req.CardDetails); err != nil {
			return nil, err
		}
	}

	// Process payment with external provider
	paymentResult, err := ts.processExternalPayment(req, transactionRef)
	if err != nil {
		// Update transaction status to failed
		tx.Exec("UPDATE transactions SET status = 'failed', updated_at = NOW() WHERE id = ?", transactionID)
		tx.Commit()
		
		return &TransactionResponse{
			Success: false,
			Message: fmt.Sprintf("Payment processing failed: %v", err),
			Status:  "failed",
		}, nil
	}

	// Update transaction status to completed
	_, err = tx.Exec("UPDATE transactions SET status = 'completed', completed_at = NOW(), updated_at = NOW() WHERE id = ?", transactionID)
	if err != nil {
		return nil, err
	}

	// Update item owner's balance
	if err := ts.updateOwnerBalance(tx, req.ItemID, netAmount); err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	// Log transaction
	ts.logTransaction(int(transactionID), "payment_completed", "completed", "Payment processed successfully", "", "")

	return &TransactionResponse{
		Success:       true,
		Message:       "Payment processed successfully",
		TransactionID: transactionRef,
		Status:        "completed",
	}, nil
}

func (ts *TransactionService) ProcessPayout(userID int, req *PayoutRequest) (*TransactionResponse, error) {
	// Validate payout request
	if err := ts.validatePayoutRequest(req); err != nil {
		return &TransactionResponse{
			Success: false,
			Message: fmt.Sprintf("Validation error: %v", err),
		}, nil
	}

	// Check user balance
	balance, err := ts.getUserBalance(userID)
	if err != nil {
		return nil, err
	}

	if balance.AvailableBalance < req.Amount {
		return &TransactionResponse{
			Success: false,
			Message: "Insufficient balance",
		}, nil
	}

	// Generate transaction reference
	transactionRef := ts.generateTransactionRef("OUT")

	// Calculate fees
	processingFee := req.Amount * 0.025 // 2.5% processing fee
	netAmount := req.Amount - processingFee

	// Create transaction record
	tx, err := ts.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	query := `INSERT INTO transactions (user_id, type, amount, currency, payment_method, transaction_ref, processing_fee, net_amount, status) 
			  VALUES (?, 'payout', ?, ?, ?, ?, ?, ?, 'processing')`
	
	result, err := tx.Exec(query, userID, req.Amount, req.Currency, req.PayoutMethod, transactionRef, processingFee, netAmount)
	if err != nil {
		return nil, err
	}

	transactionID, _ := result.LastInsertId()

	// Encrypt and store sensitive bank data
	if req.BankDetails != nil {
		if err := ts.storeEncryptedBankData(tx, int(transactionID), req.BankDetails); err != nil {
			return nil, err
		}
	}

	// Update user balance (deduct payout amount)
	_, err = tx.Exec("UPDATE user_balances SET available_balance = available_balance - ?, pending_balance = pending_balance + ?, updated_at = NOW() WHERE user_id = ?", 
		req.Amount, req.Amount, userID)
	if err != nil {
		return nil, err
	}

	// Process payout with external provider
	payoutResult, err := ts.processExternalPayout(req, transactionRef)
	if err != nil {
		// Revert balance changes and mark as failed
		tx.Exec("UPDATE user_balances SET available_balance = available_balance + ?, pending_balance = pending_balance - ? WHERE user_id = ?", 
			req.Amount, req.Amount, userID)
		tx.Exec("UPDATE transactions SET status = 'failed', updated_at = NOW() WHERE id = ?", transactionID)
		tx.Commit()
		
		return &TransactionResponse{
			Success: false,
			Message: fmt.Sprintf("Payout processing failed: %v", err),
			Status:  "failed",
		}, nil
	}

	// Update transaction status
	status := "pending" // Payouts typically take time to process
	if payoutResult {
		status = "completed"
		// Move from pending to completed
		tx.Exec("UPDATE user_balances SET pending_balance = pending_balance - ? WHERE user_id = ?", req.Amount, userID)
	}

	_, err = tx.Exec("UPDATE transactions SET status = ?, updated_at = NOW() WHERE id = ?", status, transactionID)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	// Log transaction
	ts.logTransaction(int(transactionID), "payout_requested", status, "Payout request processed", "", "")

	return &TransactionResponse{
		Success:       true,
		Message:       "Payout request processed successfully",
		TransactionID: transactionRef,
		Status:        status,
	}, nil
}

func (ts *TransactionService) GetTransactionHistory(userID int, limit, offset int) ([]Transaction, error) {
	query := `SELECT id, user_id, type, amount, currency, status, payment_method, transaction_ref, 
			  item_id, processing_fee, net_amount, created_at, updated_at, completed_at 
			  FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
	
	rows, err := ts.db.Query(query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []Transaction
	for rows.Next() {
		var t Transaction
		err := rows.Scan(&t.ID, &t.UserID, &t.Type, &t.Amount, &t.Currency, &t.Status, 
			&t.PaymentMethod, &t.TransactionRef, &t.ItemID, &t.ProcessingFee, 
			&t.NetAmount, &t.CreatedAt, &t.UpdatedAt, &t.CompletedAt)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, t)
	}

	return transactions, nil
}

func (ts *TransactionService) GetUserBalance(userID int) (*UserBalance, error) {
	return ts.getUserBalance(userID)
}

// Helper methods
func (ts *TransactionService) validatePaymentRequest(req *PaymentRequest) error {
	if req.Amount <= 0 {
		return fmt.Errorf("amount must be greater than 0")
	}

	if req.Currency != "USD" && req.Currency != "EUR" && req.Currency != "GBP" {
		return fmt.Errorf("unsupported currency")
	}

	if req.PaymentMethod == "card" && req.CardDetails != nil {
		if !validateCardNumber(req.CardDetails.Number) {
			return fmt.Errorf("invalid card number")
		}
		if !validateExpiryDate(req.CardDetails.ExpiryMonth, req.CardDetails.ExpiryYear) {
			return fmt.Errorf("invalid expiry date")
		}
		if len(req.CardDetails.CVV) < 3 || len(req.CardDetails.CVV) > 4 {
			return fmt.Errorf("invalid CVV")
		}
		if len(req.CardDetails.HolderName) < 2 {
			return fmt.Errorf("invalid cardholder name")
		}
	}

	return nil
}

func (ts *TransactionService) validatePayoutRequest(req *PayoutRequest) error {
	if req.Amount <= 0 {
		return fmt.Errorf("amount must be greater than 0")
	}

	if req.Currency != "USD" && req.Currency != "EUR" && req.Currency != "GBP" {
		return fmt.Errorf("unsupported currency")
	}

	if req.PayoutMethod == "bank" && req.BankDetails != nil {
		if len(req.BankDetails.AccountHolder) < 2 {
			return fmt.Errorf("invalid account holder name")
		}
		if len(req.BankDetails.BankName) < 2 {
			return fmt.Errorf("invalid bank name")
		}
		if len(req.BankDetails.RoutingNumber) < 8 {
			return fmt.Errorf("invalid routing number")
		}
		if len(req.BankDetails.AccountNumber) < 8 {
			return fmt.Errorf("invalid account number")
		}
	}

	if req.PayoutMethod == "paypal" && !validateEmail(req.PayPalEmail) {
		return fmt.Errorf("invalid PayPal email")
	}

	return nil
}

func (ts *TransactionService) generateTransactionRef(prefix string) string {
	timestamp := time.Now().Unix()
	return fmt.Sprintf("%s_%d_%d", prefix, timestamp, time.Now().Nanosecond()%1000000)
}

func (ts *TransactionService) storeEncryptedPaymentData(tx *sql.Tx, transactionID int, cardDetails *CardDetails) error {
	// Mask card number for logging (keep only last 4 digits)
	maskedCard := *cardDetails
	if len(cardDetails.Number) > 4 {
		maskedCard.Number = "****-****-****-" + cardDetails.Number[len(cardDetails.Number)-4:]
	}

	data, _ := json.Marshal(cardDetails)
	encryptedData, err := encrypt(string(data), ts.config.EncryptionKey)
	if err != nil {
		return err
	}

	_, err = tx.Exec("INSERT INTO encrypted_payment_data (transaction_id, encrypted_data) VALUES (?, ?)", 
		transactionID, encryptedData)
	return err
}

func (ts *TransactionService) storeEncryptedBankData(tx *sql.Tx, transactionID int, bankDetails *BankDetails) error {
	// Mask account number for logging
	maskedBank := *bankDetails
	if len(bankDetails.AccountNumber) > 4 {
		maskedBank.AccountNumber = "****" + bankDetails.AccountNumber[len(bankDetails.AccountNumber)-4:]
	}

	data, _ := json.Marshal(bankDetails)
	encryptedData, err := encrypt(string(data), ts.config.EncryptionKey)
	if err != nil {
		return err
	}

	_, err = tx.Exec("INSERT INTO encrypted_payment_data (transaction_id, encrypted_data) VALUES (?, ?)", 
		transactionID, encryptedData)
	return err
}

func (ts *TransactionService) processExternalPayment(req *PaymentRequest, transactionRef string) (bool, error) {
	// Simulate external payment processing
	// In real implementation, integrate with Stripe, PayPal, etc.
	
	switch req.PaymentMethod {
	case "card":
		// Simulate Stripe payment
		time.Sleep(2 * time.Second) // Simulate processing time
		return true, nil
	case "paypal":
		// Simulate PayPal payment
		time.Sleep(1 * time.Second)
		return true, nil
	case "apple":
		// Simulate Apple Pay
		time.Sleep(1 * time.Second)
		return true, nil
	default:
		return false, fmt.Errorf("unsupported payment method")
	}
}

func (ts *TransactionService) processExternalPayout(req *PayoutRequest, transactionRef string) (bool, error) {
	// Simulate external payout processing
	// In real implementation, integrate with bank APIs, PayPal, etc.
	
	switch req.PayoutMethod {
	case "bank":
		// Simulate bank transfer (usually takes 1-3 business days)
		time.Sleep(1 * time.Second)
		return false, nil // Return false to indicate pending status
	case "paypal":
		// Simulate PayPal payout (usually instant)
		time.Sleep(1 * time.Second)
		return true, nil
	default:
		return false, fmt.Errorf("unsupported payout method")
	}
}

func (ts *TransactionService) updateOwnerBalance(tx *sql.Tx, itemID int, amount float64) error {
	// Get item owner
	var ownerID int
	err := tx.QueryRow("SELECT user_id FROM items WHERE id = ?", itemID).Scan(&ownerID)
	if err != nil {
		return err
	}

	// Update or create balance record
	_, err = tx.Exec(`INSERT INTO user_balances (user_id, available_balance, total_earnings) 
					  VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE 
					  available_balance = available_balance + ?, 
					  total_earnings = total_earnings + ?, 
					  updated_at = NOW()`, 
		ownerID, amount, amount, amount, amount)
	
	return err
}

func (ts *TransactionService) getUserBalance(userID int) (*UserBalance, error) {
	var balance UserBalance
	query := `SELECT user_id, available_balance, pending_balance, total_earnings, updated_at 
			  FROM user_balances WHERE user_id = ?`
	
	err := ts.db.QueryRow(query, userID).Scan(&balance.UserID, &balance.AvailableBalance, 
		&balance.PendingBalance, &balance.TotalEarnings, &balance.UpdatedAt)
	
	if err == sql.ErrNoRows {
		// Create new balance record
		_, err = ts.db.Exec("INSERT INTO user_balances (user_id) VALUES (?)", userID)
		if err != nil {
			return nil, err
		}
		return &UserBalance{UserID: userID, AvailableBalance: 0, PendingBalance: 0, TotalEarnings: 0}, nil
	}
	
	return &balance, err
}

func (ts *TransactionService) logTransaction(transactionID int, action, status, message, ipAddress, userAgent string) {
	_, err := ts.db.Exec(`INSERT INTO transaction_logs (transaction_id, action, status, message, ip_address, user_agent) 
						  VALUES (?, ?, ?, ?, ?, ?)`, 
		transactionID, action, status, message, ipAddress, userAgent)
	if err != nil {
		log.Printf("Failed to log transaction: %v", err)
	}
}

// Middleware
func authMiddleware(config *Config) gin.HandlerFunc {
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
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Set("user_id", userID)
		c.Next()
	}
}

func rateLimitMiddleware() gin.HandlerFunc {
	// Simple in-memory rate limiting (use Redis in production)
	requests := make(map[string][]time.Time)
	
	return func(c *gin.Context) {
		ip := c.ClientIP()
		now := time.Now()
		
		// Clean old requests
		if times, exists := requests[ip]; exists {
			var validTimes []time.Time
			for _, t := range times {
				if now.Sub(t) < time.Minute {
					validTimes = append(validTimes, t)
				}
			}
			requests[ip] = validTimes
		}
		
		// Check rate limit (60 requests per minute)
		if len(requests[ip]) >= 60 {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "Rate limit exceeded"})
			c.Abort()
			return
		}
		
		requests[ip] = append(requests[ip], now)
		c.Next()
	}
}

// API Handlers
func setupRoutes(ts *TransactionService, config *Config) *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	
	// CORS configuration
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"http://localhost:3000", "https://yourdomain.com"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(corsConfig))
	
	// Rate limiting
	r.Use(rateLimitMiddleware())
	
	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy", "timestamp": time.Now()})
	})
	
	// API routes
	api := r.Group("/api/v1")
	api.Use(authMiddleware(config))
	
	// Payment endpoints
	api.POST("/payments", func(c *gin.Context) {
		userID := c.GetInt("user_id")
		var req PaymentRequest
		
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		
		response, err := ts.ProcessPayment(userID, &req)
		if err != nil {
			log.Printf("Payment processing error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			return
		}
		
		if response.Success {
			c.JSON(http.StatusOK, response)
		} else {
			c.JSON(http.StatusBadRequest, response)
		}
	})
	
	// Payout endpoints
	api.POST("/payouts", func(c *gin.Context) {
		userID := c.GetInt("user_id")
		var req PayoutRequest
		
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		
		response, err := ts.ProcessPayout(userID, &req)
		if err != nil {
			log.Printf("Payout processing error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			return
		}
		
		if response.Success {
			c.JSON(http.StatusOK, response)
		} else {
			c.JSON(http.StatusBadRequest, response)
		}
	})
	
	// Transaction history
	api.GET("/transactions", func(c *gin.Context) {
		userID := c.GetInt("user_id")
		
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
		offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
		
		if limit > 100 {
			limit = 100 // Max limit
		}
		
		transactions, err := ts.GetTransactionHistory(userID, limit, offset)
		if err != nil {
			log.Printf("Error fetching transactions: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			return
		}
		
		c.JSON(http.StatusOK, gin.H{"transactions": transactions})
	})
	
	// User balance
	api.GET("/balance", func(c *gin.Context) {
		userID := c.GetInt("user_id")
		
		balance, err := ts.GetUserBalance(userID)
		if err != nil {
			log.Printf("Error fetching balance: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			return
		}
		
		c.JSON(http.StatusOK, balance)
	})
	
	return r
}

// Main function
func main() {
	// Load configuration
	config := loadConfig()
	
	// Connect to database
	db, err := connectDB(config)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()
	
	// Initialize database tables
	if err := initializeTables(db); err != nil {
		log.Fatalf("Failed to initialize database tables: %v", err)
	}
	
	// Create transaction service
	ts := NewTransactionService(db, config)
	
	// Setup routes
	r := setupRoutes(ts, config)
	
	// Start server
	log.Printf("Starting transaction server on port %s", config.ServerPort)
	if err := r.Run(":" + config.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}